import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CustomerSchema = z.object({
  customerType: z.enum(['B2B', 'B2C']),

  businessName: z.string().optional(),

  contactName: z.string().min(2, 'Contact name is required'),

  email: z.string().email().optional().or(z.literal('')),

  phone: z.string().optional(),

  address: z.string().optional(),

  taxNumber: z.string().optional(),

  creditLimit: z.number().min(0).default(0),
})

/* ------------------------------------------------ */
/* GET */
/* ------------------------------------------------ */

export async function GET() {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    customers: data,
  })
}

/* ------------------------------------------------ */
/* POST */
/* ------------------------------------------------ */

export async function POST(request: Request) {

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {

    const body = await request.json()

    const data = CustomerSchema.parse(body)

    const tenantId = user.user_metadata?.tenant_id

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({

        tenant_id: tenantId,

        customer_type: data.customerType,

        business_name:
          data.customerType === 'B2B'
            ? data.businessName ?? null
            : null,

        contact_name: data.contactName,

        email: data.email || null,

        phone: data.phone || null,

        address: data.address || null,

        tax_number:
          data.customerType === 'B2B'
            ? data.taxNumber || null
            : null,

        credit_limit:
          data.customerType === 'B2B'
            ? data.creditLimit
            : 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { customer },
      { status: 201 }
    )

  } catch (error) {

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            error.issues[0]?.message ??
            'Validation error',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}