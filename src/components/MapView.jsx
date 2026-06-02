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
    <div className="h-96 w-full overflow-hidden rounded-lg border">
      <iframe
        title="map"
        src={url}
        style={{ border: 0, width: '100%', height: '100%' }}
      />
      <div className="mt-2 text-xs text-slate-500">Map powered by OpenStreetMap (embedded iframe).</div>
    </div>
  )
}
