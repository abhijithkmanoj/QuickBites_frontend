import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'
import AddressAutocomplete from '../components/common/AddressAutocomplete'

export default function OwnerOnboardingPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingProfile, setExistingProfile] = useState(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    business_name: '',
    gstin: '',
    fssai_license_number: '',
    bank_account_number: '',
    ifsc_code: '',
    address_description: '',
    place_id: '',
    latitude: null,
    longitude: null,
    formatted_address: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'restaurant_owner') {
      navigate('/')
      return
    }

    // Check if profile exists
    apiClient
      .get('/owner/profile')
      .then((res) => {
        if (res.data.verification_status === 'approved') {
          navigate('/restaurant-owner/dashboard')
          return
        }

        setExistingProfile(res.data)
        setForm({
          business_name: res.data.business_name || '',
          gstin: res.data.gstin || '',
          fssai_license_number: res.data.fssai_license_number || '',
          bank_account_number: res.data.bank_account_number || '',
          ifsc_code: res.data.ifsc_code || '',
          address_description: res.data.formatted_address || res.data.address_description || '',
          place_id: res.data.place_id || '',
          latitude: res.data.latitude || null,
          longitude: res.data.longitude || null,
          formatted_address: res.data.formatted_address || '',
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

  const handleAddressSelect = (addr) => {
    setForm({
      ...form,
      address_description: addr.description || addr.formatted_address || '',
      place_id: addr.place_id || '',
      latitude: addr.lat ?? form.latitude,
      longitude: addr.lng ?? form.longitude,
      formatted_address: addr.formatted_address || addr.description || form.formatted_address,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
if (existingProfile) {
         await apiClient.put('/owner/profile', form)
       } else {
         await apiClient.post('/owner/onboard', form)
       }
      toast.success('Onboarding details submitted successfully.')
      navigate('/restaurant-owner/dashboard')
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
      <h1 className="text-2xl font-semibold text-slate-900">Restaurant Owner Onboarding</h1>
      <p className="mt-2 text-sm text-slate-600">
        Complete your business verification to start managing restaurants.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Business Name</span>
              <input
                name="business_name"
                type="text"
                required
                value={form.business_name}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter your restaurant business name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Business Address</span>
              <div className="mt-2">
                <AddressAutocomplete
                  placeholder="Enter your restaurant address"
                  defaultValue={form.address_description || form.formatted_address}
                  onAddressSelect={handleAddressSelect}
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">GSTIN (Optional)</span>
              <input
                name="gstin"
                type="text"
                value={form.gstin}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter GSTIN number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">FSSAI License Number (Optional)</span>
              <input
                name="fssai_license_number"
                type="text"
                value={form.fssai_license_number}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter FSSAI license number"
              />
            </label>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!form.business_name}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Bank Details */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Bank Account Number (Optional)</span>
              <input
                name="bank_account_number"
                type="text"
                value={form.bank_account_number}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter bank account number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">IFSC Code (Optional)</span>
              <input
                name="ifsc_code"
                type="text"
                value={form.ifsc_code}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter IFSC code"
              />
            </label>
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
        {existingProfile ? 'Verification status: ' : 'After submission, your account will be reviewed by admin. '}
        {existingProfile && (
          <span className="font-medium text-slate-700">{existingProfile.verification_status}</span>
        )}
      </p>
    </div>
  )
}