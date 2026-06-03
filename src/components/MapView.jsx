import { useEffect, useState } from 'react'

function buildOsmEmbedUrl(lat = 20.0, lng = 0.0, zoom = 13) {
  const bboxSize = 0.02
  const left = lng - bboxSize
  const right = lng + bboxSize
  const top = lat + bboxSize
  const bottom = lat - bboxSize
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`
}

export default function MapView({ center, restaurants = [] }) {
  const [url, setUrl] = useState(buildOsmEmbedUrl())

  useEffect(() => {
    if (center && center.lat && center.lng) setUrl(buildOsmEmbedUrl(center.lat, center.lng))
  }, [center])

  return (
    <div className="h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="relative">
        <iframe
          title="map"
          src={url}
          style={{ border: 0, width: '100%', height: '100%' }}
        />
        {/* Map Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                  // This would need to update center state, but we can't from here
                  // For now, just show a toast or something
                  alert('Geolocation would update map here')
                })
              }
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 12m-8 4l1.586-1.586a2 2 0 012.828 0L12 8m-8 4v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2H4a2 2 0 00-2 2z"></path>
            </svg>
          </button>
          <button
            onClick={() => {
              // Zoom in logic would go here
              alert('Zoom in would happen here')
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
            </svg>
          </button>
          <button
            onClick={() => {
              // Zoom out logic would go here
              alert('Zoom out would happen here')
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2zM16 12h2.586a1 1 0 01.707.293l.707.707a1 1 0 01-.293.707v1.414a1 1 0 01-.707.707l-.707.707a1 1 0 01-.707-.293H16a2 2 0 00-2-2v-2a2 2 0 002-2z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500 text-center">
        Map powered by OpenStreetMap (embedded iframe).
      </div>
    </div>
  )
}
