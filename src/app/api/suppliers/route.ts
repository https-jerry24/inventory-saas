import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'


const SupplierSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})


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


  const { data: suppliers, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')


  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }


  return NextResponse.json({ suppliers })
}



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

    const data = SupplierSchema.parse(body)

    const tenantId = user.user_metadata?.tenant_id


    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert({
        tenant_id: tenantId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
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
      { supplier },
      { status: 201 }
    )


  } catch (error: unknown) {

    if (error instanceof z.ZodError) {
  return NextResponse.json(
    {
      error: error.issues[0]?.message || 'Invalid data',
    },
    {
      status: 400,
    }
  )
}


    return NextResponse.json(
      {
        error: 'Something went wrong',
      },
      {
        status: 400,
      }
    )
  }
}