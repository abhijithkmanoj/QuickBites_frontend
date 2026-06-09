import { useState } from 'react'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    toast.info('Password recovery is not configured yet. Coming soon!')
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-surface-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-surface-900">Forgot password</h1>
      <p className="mt-2 text-sm text-surface-500">Enter your email and we will send a reset instruction.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-surface-700">Email</span>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-surface-300 bg-surface-50 px-4 py-3 text-sm text-surface-900 outline-none transition focus:border-surface-900 focus:ring-2 focus:ring-surface-200"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-surface-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-surface-700"
        >
          Send reset link
        </button>
      </form>
    </div>
  )
}
