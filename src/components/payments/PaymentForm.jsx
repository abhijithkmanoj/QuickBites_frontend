import React, { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '../../lib/stripe'
import apiClient from '../../lib/axios'
import { toast } from 'react-toastify'

function _PaymentFormInner({ amount, currency, orderId, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)

    try {
      // create intent on backend
      const resp = await apiClient.post('/payments/intent', { amount, currency, order_id: orderId })
      const { client_secret, payment_intent_id } = resp.data

      const card = elements.getElement(CardElement)
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card },
      })

      if (result.error) {
        toast.error(result.error.message || 'Payment failed')
        setProcessing(false)
        return
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // confirm with backend
        await apiClient.post('/payments/confirm', { payment_intent_id })
        toast.success('Payment successful')
        onSuccess && onSuccess({ payment_intent_id })
      } else {
        toast.info('Payment processing')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-3">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button type="submit" disabled={processing || !stripe} className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
        {processing ? 'Processing...' : `Pay ₹${(amount/100).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function PaymentForm({ amountCents, currency = 'inr', orderId, onSuccess }) {
  const stripePromise = getStripe()
  return (
    <Elements stripe={stripePromise}>
      <_PaymentFormInner amount={amountCents} currency={currency} orderId={orderId} onSuccess={onSuccess} />
    </Elements>
  )
}
