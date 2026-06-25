// src/app/api/audit/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)

  const table = searchParams.get('table')
  const action = searchParams.get('action')
  const limit = Number(searchParams.get('limit') || '50')

  let query = supabase
    .from('audit_logs')
    .select(`
      id,
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })
    .limit(limit)

  if (table) {
    query = query.eq('table_name', table)
  }

  if (action) {
    query = query.eq('action', action)
  }

  const { data: logs, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    logs,
  })
}