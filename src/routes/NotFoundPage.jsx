import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-4xl font-semibold text-slate-900">404</h1>
      <p className="mt-4 text-slate-600">Page not found.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700">
        Back to home
      </Link>
    </div>
  )
}
