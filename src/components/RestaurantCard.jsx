import { Link } from 'react-router-dom'

export default function RestaurantCard({ restaurant }) {
  return (
    <Link 
      to={`/restaurants/${restaurant.id}`} 
      className="group block rounded-2xl overflow-hidden border border-surface-200/80 bg-white 
                shadow-card transition-all duration-300 
                hover:shadow-card-hover hover:-translate-y-1.5 hover:border-brand-200/70"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-surface-100 to-surface-200">
        <img
          src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>'}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => { 
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>' 
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 via-transparent to-transparent" />
        
        {/* Offer Badge */}
        {restaurant.offer && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold
                        px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-500/30">
            🏷️ {restaurant.offer}
          </div>
        )}
        {/* Open/Closed Status */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md">
          <span className={`inline-block h-2 w-2 rounded-full ${restaurant.is_active !== false ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`} />
          <span className="text-[11px] font-semibold text-navy-800">{restaurant.is_active !== false ? 'Open' : 'Closed'}</span>
        </div>
        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl 
                    px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-sm font-bold text-navy-800">{restaurant.rating ?? '—'}</span>
          <span className="text-[11px] text-surface-400 font-medium">({restaurant.review_count || 0})</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-navy-900 line-clamp-1 group-hover:text-brand-600 transition-colors duration-200">{restaurant.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="badge-surface text-[11px]">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {restaurant.cuisine}
            </span>
            {restaurant.delivery_time && (
              <span className="badge-surface text-[11px]">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {restaurant.delivery_time} min
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-surface-500 leading-relaxed line-clamp-2 mb-4">
          {restaurant.description || 'Discover delicious meals from this restaurant.'}
        </p>
        <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-surface-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {restaurant.address?.split(',')[0] || 'Near you'}
          </span>
          <span className="text-xs font-semibold text-accent-600">
            {restaurant.delivery_fee > 0 ? `₹${parseFloat(restaurant.delivery_fee).toFixed(0)} delivery` : 'Free delivery'}
          </span>
        </div>
      </div>
    </Link>
  )
}
