import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminMonitoringPage() {
  const [errors, setErrors] = useState([])
  const [endpoints, setEndpoints] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMonitoring = async () => {
    setLoading(true)
    try {
      const [errorsRes, endpointsRes] = await Promise.all([
        apiClient.get('/admin/monitoring/errors'),
        apiClient.get('/admin/monitoring/endpoints'),
      ])
      setErrors(errorsRes.data || [])
      setEndpoints(Object.entries(endpointsRes.data || {}).map(([path, count]) => ({ path, count })))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load monitoring data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoring()
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Monitoring</h1>
          <p className="mt-2 text-sm text-slate-600">Backend health and usage metrics.</p>
        </div>
        <button type="button" onClick={fetchMonitoring} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recent Errors</h2>
            <div className="mt-4 max-h-96 overflow-y-auto">
              {errors.length === 0 && <p className="text-sm text-slate-600">No recent errors.</p>}
              {errors.map((err, idx) => (
                <div key={idx} className="border-b border-slate-100 py-3 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${err.status_code >= 500 ? 'text-rose-600' : 'text-amber-600'}`}>{err.status_code}</span>
                    <span className="text-xs text-slate-500">{new Date(err.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-900">{err.message}</p>
                  <p className="text-xs text-slate-500">{err.path}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Top Endpoints</h2>
            <div className="mt-4 max-h-96 overflow-y-auto">
              {endpoints.length === 0 && <p className="text-sm text-slate-600">No endpoint traffic yet.</p>}
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
                  <span className="text-sm text-slate-900">{ep.path}</span>
                  <span className="text-sm font-semibold text-slate-900">{ep.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
