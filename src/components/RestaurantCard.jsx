import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="block rounded-3xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
          <img
            src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-slate-900">{restaurant.name}</div>
              <div className="text-sm text-slate-600">{restaurant.cuisine} · {restaurant.address}</div>
            </div>
            <div className="text-sm font-semibold text-slate-700">{restaurant.rating ?? '—'}</div>
          </div>
          {restaurant.offer && (
            <div className="mt-2 text-sm text-emerald-700">{restaurant.offer}</div>
          )}
        </div>
      </div>
    </Link>
  )
}
