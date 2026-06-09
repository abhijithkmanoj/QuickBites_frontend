import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../features/auth/authService'

export default function FavoritesPage() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState(null)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)

  useEffect(() => {
    if (user?.id) loadFavorites()
  }, [user?.id, page, filterType])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const result = await authService.getFavorites(filterType, page * limit, limit)
      setFavorites(result.items || [])
      setTotal(result.total || 0)
    } catch { toast.error('Failed to load favorites') }
    finally { setLoading(false) }
  }

  const handleRemoveFavorite = async (favoriteId) => {
    if (!window.confirm('Remove from favorites?')) return
    try {
      await authService.removeFavorite(favoriteId)
      toast.success('Removed from favorites')
      loadFavorites()
    } catch { toast.error('Failed to remove favorite') }
  }

  const handleNavigateToItem = (favoriteType, favoriteId) => {
    if (favoriteType === 'restaurant') navigate(`/restaurants/${favoriteId}`)
    else if (favoriteType === 'menu_item') navigate(`/restaurants?item=${favoriteId}`)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">My Favorites</h1>
          <p className="mt-1 text-sm text-surface-500">Your saved restaurants and menu items</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: null, label: 'All' },
          { key: 'restaurant', label: '🏪 Restaurants' },
          { key: 'menu_item', label: '🍽️ Menu Items' },
        ].map(({ key, label }) => (
          <button
            key={key || 'all'}
            onClick={() => { setFilterType(key); setPage(0) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filterType === key ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-sm text-surface-500">Loading favorites...</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
              <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy-900">No favorites yet</h3>
            <p className="text-sm text-surface-500">Browse restaurants and tap the heart icon to save your favorites.</p>
            <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="card-premium group cursor-pointer" onClick={() => handleNavigateToItem(favorite.favorite_type, favorite.favorite_id)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg">
                    {favorite.favorite_type === 'restaurant' ? '🏪' : '🍽️'}
                  </span>
                  <span className="badge-surface text-[11px]">
                    {favorite.favorite_type === 'restaurant' ? 'Restaurant' : 'Menu Item'}
                  </span>
                </div>
                <h3 className="font-semibold text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {favorite.favorite_id}
                </h3>
                <p className="mt-1 text-xs text-surface-400">
                  Saved on {new Date(favorite.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleNavigateToItem(favorite.favorite_type, favorite.favorite_id) }} className="flex-1 btn-primary !py-2 !text-xs">View</button>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(favorite.id) }} className="flex-1 btn-secondary !py-2 !text-xs !border-rose-200 hover:!bg-rose-50 hover:!text-rose-600">Remove</button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary">Previous</button>
              <span className="text-sm text-surface-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
