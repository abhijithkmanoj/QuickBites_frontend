import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  return (
    <Link 
      to={`/restaurants/${restaurant.id}`} 
      className="block rounded-2xl overflow-hidden border border-slate-100 bg-white 
                shadow-sm transition-all duration-300 
                hover:border-brand-400 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { 
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' 
          }}
        />
        {/* Offer Badge */}
        {restaurant.offer && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-medium 
                        px-2 py-1 rounded-full shadow-md">
            {restaurant.offer}
          </div>
        )}
        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full 
                    px-3 py-1 flex items-center gap-1 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.218 3.932a1 1 0 001.516.577l4.254-2.366a1 1 0 00.524-1.57l-2.922-4.188a1 1 0 00-1.134-.894l-3.18 1.783a1 1 0 00-.976.588l-1.389-4.28a1 1 0 00-.365-1.39z"></path>
          </svg>
          <span className="text-sm font-medium text-amber-600">{restaurant.rating ?? '—'}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{restaurant.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs text-slate-500">#{restaurant.cuisine}</span>
            {restaurant.delivery_time && (
              <span className="text-xs text-slate-500">⏱ {restaurant.delivery_time}min</span>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {restaurant.description || 'No description available'}
        </p>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">{restaurant.address}</span>
          <span className="text-sm font-medium text-slate-700">
            ${parseFloat(restaurant.delivery_fee || 0).toFixed(2)} delivery
          </span>
        </div>
      </div>
    </Link>
  )
}
