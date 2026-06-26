import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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
    const { sql } = (await request.json()) as { sql?: string }

    if (
      !sql ||
      typeof sql !== 'string' ||
      !sql.trim().toUpperCase().startsWith('EXPLAIN')
    ) {
      return NextResponse.json(
        { error: 'Only EXPLAIN queries are allowed' },
        { status: 400 }
      )
    }

    const result = await prisma.$queryRawUnsafe(sql)

    const plan = Array.isArray(result)
      ? result
          .map((row) => {
            if (
              row &&
              typeof row === 'object' &&
              !Array.isArray(row)
            ) {
              const values = Object.values(
                row as Record<string, unknown>
              )

              return values.length > 0
                ? String(values[0])
                : ''
            }

            return String(row)
          })
          .join('\n')
      : String(result)

    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to execute query'

    console.error('EXPLAIN ERROR:', error)

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}