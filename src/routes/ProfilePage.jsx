import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  loadUser,
  logout,
  updateProfile,
  uploadProfilePic,
  removeProfilePic,
  fetchSettings,
  saveSettings,
  updatePassword,
  deactivateUser,
} from '../features/auth/authSlice'

// ─── Helpers ──────────────────────────────────────────────────

const TABS = [
  { key: 'profile', label: '👤 Profile' },
  { key: 'settings', label: '⚙️ Settings' },
  { key: 'security', label: '🔒 Security' },
  { key: 'account', label: '🗑️ Account' },
]

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
      {...props}
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
      {...props}
    >
      {children}
    </select>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? 'bg-slate-900' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )
}

function SaveButton({ saving, label = 'Save changes' }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
    >
      {saving ? 'Saving…' : label}
    </button>
  )
}

// ─── Profile tab ──────────────────────────────────────────────

function ProfileTab({ user }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    bio: user.bio || '',
    gender: user.gender || '',
    date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
  })
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.date_of_birth) delete payload.date_of_birth
      await dispatch(updateProfile(payload)).unwrap()
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPic(true)
    try {
      await dispatch(uploadProfilePic(file)).unwrap()
      toast.success('Profile picture updated.')
    } catch (err) {
      toast.error(err || 'Failed to upload picture.')
    } finally {
      setUploadingPic(false)
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile picture?')) return
    try {
      await dispatch(removeProfilePic()).unwrap()
      toast.success('Profile picture removed.')
    } catch (err) {
      toast.error(err || 'Failed to remove picture.')
    }
  }

  const avatarUrl = user.profile_image_url || user.profile_image
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-500">
              {initials}
            </div>
          )}
          {uploadingPic && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <span className="text-xs text-white">…</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
            {uploadingPic ? 'Uploading…' : 'Change photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploadingPic}
            />
          </label>
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={1}
            maxLength={120}
          />
        </Field>
        <Field label="Phone">
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 9000000000"
          />
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Date of birth">
          <Input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            maxLength={300}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white sm:col-span-2"
            placeholder="A short bio about yourself…"
          />
        </Field>
      </div>

      {/* Read-only info */}
      <div className="rounded-xl bg-slate-50 p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Email</span>
          <span className="font-medium text-slate-900">{user.email}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Role</span>
          <span className="capitalize font-medium text-slate-900">{user.role.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Member since</span>
          <span className="font-medium text-slate-900">
            {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <SaveButton saving={saving} />
    </form>
  )
}

// ─── Settings tab ─────────────────────────────────────────────

function SettingsTab({ user, settings }) {
  const dispatch = useDispatch()
  const [notif, setNotif] = useState(
    settings?.notification_preference || {
      order_updates: true,
      promotions: true,
      newsletter: false,
    },
  )
  const [privacy, setPrivacy] = useState(
    settings?.privacy_settings || {
      show_profile: true,
      show_order_history: false,
    },
  )
  const [theme, setTheme] = useState(settings?.theme_preference || user.theme_preference || 'system')
  const [lang, setLang] = useState(settings?.language_preference || user.language_preference || 'en')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await dispatch(
        saveSettings({
          notification_preference: notif,
          privacy_settings: privacy,
          theme_preference: theme,
          language_preference: lang,
        }),
      ).unwrap()
      toast.success('Settings saved.')
    } catch (err) {
      toast.error(err || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Notifications */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4">
          <Toggle
            label="Order updates"
            checked={!!notif.order_updates}
            onChange={(v) => setNotif({ ...notif, order_updates: v })}
          />
          <Toggle
            label="Promotions & offers"
            checked={!!notif.promotions}
            onChange={(v) => setNotif({ ...notif, promotions: v })}
          />
          <Toggle
            label="Newsletter"
            checked={!!notif.newsletter}
            onChange={(v) => setNotif({ ...notif, newsletter: v })}
          />
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Privacy</h3>
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4">
          <Toggle
            label="Show my profile to others"
            checked={!!privacy.show_profile}
            onChange={(v) => setPrivacy({ ...privacy, show_profile: v })}
          />
          <Toggle
            label="Show order history"
            checked={!!privacy.show_order_history}
            onChange={(v) => setPrivacy({ ...privacy, show_order_history: v })}
          />
        </div>
      </div>

      {/* Appearance & Language */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Theme">
          <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System default</option>
          </Select>
        </Field>
        <Field label="Language">
          <Select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
            <option value="mr">Marathi</option>
          </Select>
        </Field>
      </div>

      <SaveButton saving={saving} />
    </form>
  )
}

// ─── Security tab ─────────────────────────────────────────────

function SecurityTab() {
  const dispatch = useDispatch()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      toast.error('New passwords do not match.')
      return
    }
    if (form.new_password.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      await dispatch(
        updatePassword({ currentPassword: form.current_password, newPassword: form.new_password }),
      ).unwrap()
      toast.success('Password changed successfully.')
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err || 'Failed to change password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <p className="text-sm text-slate-500">
        Choose a strong password with at least 8 characters.
      </p>
      <Field label="Current password">
        <Input
          type="password"
          value={form.current_password}
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
          required
          autoComplete="current-password"
        />
      </Field>
      <Field label="New password">
        <Input
          type="password"
          value={form.new_password}
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Confirm new password">
        <Input
          type="password"
          value={form.confirm_password}
          onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      <SaveButton saving={saving} label="Change password" />
    </form>
  )
}

// ─── Account tab ──────────────────────────────────────────────

function AccountTab() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleDeactivate = async (e) => {
    e.preventDefault()
    if (!confirmed) {
      toast.error('Please check the confirmation checkbox first.')
      return
    }
    setSaving(true)
    try {
      await dispatch(deactivateUser(password)).unwrap()
      toast.success('Account deactivated. You have been logged out.')
      await dispatch(logout())
      navigate('/login')
    } catch (err) {
      toast.error(err || 'Failed to deactivate account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-sm space-y-6">
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <h3 className="text-sm font-semibold text-rose-700">Danger zone</h3>
        <p className="mt-1 text-xs text-rose-600">
          Deactivating your account will prevent you from logging in. Your order history and data
          will be retained. An admin can reactivate your account on request.
        </p>
      </div>

      <form onSubmit={handleDeactivate} className="space-y-4">
        <Field label="Confirm your password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password to confirm"
          />
        </Field>

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <span>I understand this will deactivate my account.</span>
        </label>

        <button
          type="submit"
          disabled={saving || !confirmed}
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {saving ? 'Deactivating…' : 'Deactivate my account'}
        </button>
      </form>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, settings, status, settingsStatus } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(loadUser())
    }
  }, [dispatch, status, user])

  useEffect(() => {
    if (user && settingsStatus === 'idle') {
      dispatch(fetchSettings())
    }
  }, [dispatch, user, settingsStatus])

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  if (status === 'loading' && !user) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading profile…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">No profile available.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Log out
        </button>
      </div>

      {/* Tabs + content */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'settings' && <SettingsTab user={user} settings={settings} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'account' && <AccountTab />}
        </div>
      </div>
    </div>
  )
}
