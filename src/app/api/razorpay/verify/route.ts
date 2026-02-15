import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json()

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex')

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Update user subscription
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 1 week

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', user.id)

      await supabase.from('payments').insert({
        user_id: user.id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: 2900,
        status: 'paid',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
