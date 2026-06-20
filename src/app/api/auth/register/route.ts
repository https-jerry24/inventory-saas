import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const RegisterSchema = z.object({
  companyName: z.string().min(2, 'Company name too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
  yourName: z.string().min(2, 'Name too short'),
})

export async function POST(request: Request) {
  try {
    const data = RegisterSchema.parse(await request.json())

    const slug = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')

    // Create tenant
    const tenant = await prisma.tenants.create({
      data: {
        name: data.companyName,
        slug: slug,
        plan: 'free',
      },
    })

    // Create Supabase Auth user
    const supabase = await createClient()

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            tenant_id: tenant.id,
            role: 'admin',
            name: data.yourName,
          },
        },
      })

    if (authError) {

      // Rollback tenant if auth fails
      await prisma.tenants.delete({
        where: {
          id: tenant.id,
        },
      })

      return NextResponse.json(
        {
          error: authError.message,
        },
        {
          status: 400,
        }
      )
    }


    if (!authData.user) {
      return NextResponse.json(
        {
          error: 'User creation failed',
        },
        {
          status: 400,
        }
      )
    }


    // Create user record in your database
    await prisma.users.create({
      data: {
        id: authData.user.id,
        tenant_id: tenant.id,
        email: data.email,
        name: data.yourName,
        role: 'admin',
      },
    })


    return NextResponse.json({
      success: true,
      message: 'Account created! Check your email.',
    })


  } catch (error) {

    console.error(error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0].message,
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
        status: 500,
      }
    )
  }
}