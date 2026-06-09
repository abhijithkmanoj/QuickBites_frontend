import React from 'react'

export default function ETADisplay({ etaMinutes }) {
  if (etaMinutes == null) {
    return <div className="text-sm text-slate-500">ETA not available</div>
  }
  if (etaMinutes <= 1) {
    return <div className="text-sm text-slate-700">Arriving now</div>
  }
  return <div className="text-sm text-slate-700">Arriving in ~{Math.round(etaMinutes)} minutes</div>
}
