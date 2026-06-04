import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { register, resetAuth } from '../features/auth/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' })

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(resetAuth())
    try {
      await dispatch(register(form)).unwrap()
      toast.success('Account created successfully.')
      navigate('/')
    } catch (registerError) {
      toast.error(registerError || 'Registration failed.')
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create your QuickBites account</h1>
      <p className="mt-2 text-sm text-slate-600">Register to save orders and access your profile.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Account Type</span>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          >
            <option value="customer">Customer</option>
            <option value="restaurant_owner">Restaurant Owner</option>
          </select>
        </label>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <p className="mt-6 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="text-slate-900 hover:underline">Sign in.</Link>
      </p>
    </div>
  )
}
