import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type InventoryLog = {
  qty_change: number
  created_at: string
}

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

  // Last 30 days
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)

  const { data, error } = await supabase
    .from('inventory_logs')
    .select('qty_change, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const logs = (data ?? []) as InventoryLog[]

  const dayMap: Record<
    string,
    {
      date: string
      stockIn: number
      stockOut: number
    }
  > = {}

  logs.forEach((log) => {
    const date = log.created_at.slice(0, 10)

    if (!dayMap[date]) {
      dayMap[date] = {
        date,
        stockIn: 0,
        stockOut: 0,
      }
    }

    if (log.qty_change > 0) {
      dayMap[date].stockIn += log.qty_change
    } else {
      dayMap[date].stockOut += Math.abs(
        log.qty_change
      )
    }
  })

  const chartData = Object.values(dayMap)

  const totalIn = chartData.reduce(
    (sum, day) => sum + day.stockIn,
    0
  )

  const totalOut = chartData.reduce(
    (sum, day) => sum + day.stockOut,
    0
  )

  return NextResponse.json({
    chartData,
    totalIn,
    totalOut,
    daysQueried: chartData.length,
  })
}