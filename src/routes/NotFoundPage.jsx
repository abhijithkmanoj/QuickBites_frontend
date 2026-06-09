import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="rounded-3xl border border-surface-200 bg-white p-10 shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-surface-900 tracking-tight">404</h1>
        <p className="mt-4 text-lg text-surface-500">This page doesn't exist.</p>
        <p className="mt-2 text-sm text-surface-400">
          The link might be broken, or the page may have been removed.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-surface-900 px-6 py-3 text-sm font-semibold text-white hover:bg-surface-800 transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
