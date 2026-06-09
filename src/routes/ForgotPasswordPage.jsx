import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    toast.info('Password recovery is not configured yet. Coming soon!')
    setEmail('')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-600 shadow-lg shadow-brand-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-navy-900">Quick<span className="text-gradient">Bites</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">Forgot password</h1>
          <p className="mt-2 text-sm text-surface-500">Enter your email and we'll send a reset link</p>
        </div>

        <div className="rounded-2xl border border-surface-200/80 bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="input-premium pl-10"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Send reset link</button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-surface-500">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
