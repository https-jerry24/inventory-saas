import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type Product = {
  name: string
  sku: string
  quantity_on_hand: number
  reorder_point: number
}

export async function POST() {
  try {
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

    const { data: products, error } = await supabase
      .from('products')
      .select(
        `
        name,
        sku,
        quantity_on_hand,
        reorder_point
      `
      )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const lowStockProducts =
      (products as Product[])?.filter(
        (p) =>
          p.quantity_on_hand <= p.reorder_point
      ) || []

    if (lowStockProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          'All stock levels are healthy. No alerts needed.',
      })
    }

    const productRows = lowStockProducts
      .map(
        (p) => `
        <tr style="border-top:1px solid #e2e8f0;">
          <td style="padding:10px 16px;">
            ${p.name}
          </td>

          <td style="
            padding:10px 16px;
            font-family:monospace;
            color:#64748b;
          ">
            ${p.sku}
          </td>

          <td style="
            padding:10px 16px;
            font-weight:bold;
            color:${
              p.quantity_on_hand === 0
                ? '#dc2626'
                : '#ea580c'
            };
          ">
            ${p.quantity_on_hand}
          </td>

          <td style="
            padding:10px 16px;
            color:#64748b;
          ">
            ${p.reorder_point}
          </td>
        </tr>
      `
      )
      .join('')

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body
        style="
          font-family:Arial,sans-serif;
          background:#f8fafc;
          padding:20px;
        "
      >
        <div
          style="
            max-width:600px;
            margin:0 auto;
            background:white;
            border-radius:12px;
            overflow:hidden;
          "
        >
          <div
            style="
              background:#0F2D5C;
              padding:24px;
            "
          >
            <h1
              style="
                color:white;
                margin:0;
                font-size:22px;
              "
            >
              Low Stock Alert
            </h1>

            <p
              style="
                color:#93C5FD;
                margin:8px 0 0;
                font-size:14px;
              "
            >
              ${lowStockProducts.length}
              product(s) need restocking
            </p>
          </div>

          <div style="padding:24px;">
            <table
              style="
                width:100%;
                border-collapse:collapse;
              "
            >
              <thead style="background:#f1f5f9;">
                <tr>
                  <th
                    style="
                      text-align:left;
                      padding:10px 16px;
                      font-size:12px;
                      color:#64748b;
                    "
                  >
                    PRODUCT
                  </th>

                  <th
                    style="
                      text-align:left;
                      padding:10px 16px;
                      font-size:12px;
                      color:#64748b;
                    "
                  >
                    SKU
                  </th>

                  <th
                    style="
                      text-align:left;
                      padding:10px 16px;
                      font-size:12px;
                      color:#64748b;
                    "
                  >
                    CURRENT QTY
                  </th>

                  <th
                    style="
                      text-align:left;
                      padding:10px 16px;
                      font-size:12px;
                      color:#64748b;
                    "
                  >
                    REORDER AT
                  </th>
                </tr>
              </thead>

              <tbody>
                ${productRows}
              </tbody>
            </table>

            <div
              style="
                margin-top:24px;
                padding:16px;
                background:#fef2f2;
                border-radius:8px;
              "
            >
              <p
                style="
                  margin:0;
                  color:#991b1b;
                  font-size:14px;
                "
              >
                Please place purchase orders to
                restock these items immediately.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error: emailError } =
      await resend.emails.send({
        from:
          'Inventory Alert <onboarding@resend.dev>',
        to: [
          process.env.ALERT_EMAIL ||
            user.email ||
            '',
        ],
        subject: `[URGENT] ${lowStockProducts.length} Low Stock Alert(s)`,
        html: emailHtml,
      })

    if (emailError) {
      return NextResponse.json(
        { error: emailError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Alert email sent for ${lowStockProducts.length} low-stock product(s)`,
      emailId: data?.id,
      alertsSent: lowStockProducts.length,
      products: lowStockProducts.map(
        (p) => p.name
      ),
    })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}