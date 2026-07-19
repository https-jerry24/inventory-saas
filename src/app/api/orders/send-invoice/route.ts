import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email, invoice } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email address' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'StockFlow <onboarding@resend.dev>',
      to: email,
      subject: `Purchase Invoice ${invoice.invoiceNumber}`,
      html: `
      <div style="font-family:Arial;padding:30px">
        <h2 style="color:#059669">
          StockFlow
        </h2>

        <p>Hello,</p>

        <p>
          Your purchase invoice
          <strong>${invoice.invoiceNumber}</strong>
          has been generated.
        </p>

        <table
          cellpadding="8"
          style="border-collapse:collapse;border:1px solid #ddd"
        >
          <tr>
            <td><b>Date</b></td>
            <td>${new Date(invoice.issuedAt).toLocaleDateString()}</td>
          </tr>

          <tr>
            <td><b>Status</b></td>
            <td>${invoice.status}</td>
          </tr>

          <tr>
            <td><b>Total</b></td>
            <td>Rs ${invoice.totalAmount.toLocaleString()}</td>
          </tr>
        </table>

        <br>

        <p>
          Thank you for choosing
          <strong>StockFlow</strong>.
        </p>
      </div>
      `,
    })

    return NextResponse.json({
      success: true,
    })
  } catch {
    return NextResponse.json(
      { error: 'Unable to send email.' },
      { status: 500 }
    )
  }
}