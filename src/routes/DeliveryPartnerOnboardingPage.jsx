import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'

export default function DeliveryPartnerOnboardingPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingProfile, setExistingProfile] = useState(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    vehicle_type: 'bike',
    license_number: '',
    aadhar_number: '',
    vehicle_number: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'delivery_partner') {
      navigate('/')
      return
    }

    // Check if profile exists
    apiClient
      .get('/delivery/profile')
      .then((res) => {
        setExistingProfile(res.data)
        setForm({
          vehicle_type: res.data.vehicle_type || 'bike',
          license_number: res.data.license_number || '',
          aadhar_number: res.data.aadhar_number || '',
          vehicle_number: res.data.vehicle_number || '',
        })
      })
      .catch(() => {
        // No profile yet, continue with onboarding
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (existingProfile) {
        await apiClient.put('/delivery/profile', form)
      } else {
        await apiClient.post('/delivery/onboard', form)
      }
      toast.success('Onboarding details submitted successfully.')
      navigate('/delivery-partner/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit onboarding details.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Delivery Partner Onboarding</h1>
      <p className="mt-2 text-sm text-slate-600">
        Complete your verification to start accepting delivery assignments.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Step 1: Vehicle Details */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Vehicle Type</span>
              <select
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">License Number</span>
              <input
                name="license_number"
                type="text"
                required
                value={form.license_number}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter your vehicle license number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Vehicle Number</span>
              <input
                name="vehicle_number"
                type="text"
                value={form.vehicle_number}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter your vehicle registration number"
              />
            </label>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.license_number}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Aadhar Number (Optional)</span>
              <input
                name="aadhar_number"
                type="text"
                value={form.aadhar_number}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter Aadhar number for verification"
              />
            </label>
            <p className="text-xs text-slate-500">
              After submission, your application will be reviewed by admin. You'll receive a notification once approved.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Submitting...' : existingProfile ? 'Update Details' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-sm text-slate-500">
        {existingProfile ? 'Verification status: ' : 'After submission, your account will be reviewed by admin.'}
        {existingProfile && (
          <span className="font-medium text-slate-700">{existingProfile.verification_status}</span>
        )}
      </p>
    </div>
  )
}