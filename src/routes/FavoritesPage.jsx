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
    if (user?.id) {
      loadFavorites()
    }
  }, [user?.id, page, filterType])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const result = await authService.getFavorites(filterType, page * limit, limit)
      setFavorites(result.items || [])
      setTotal(result.total || 0)
    } catch (error) {
      toast.error('Failed to load favorites')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (favoriteId) => {
    if (!window.confirm('Remove from favorites?')) return
    try {
      await authService.removeFavorite(favoriteId)
      toast.success('Removed from favorites')
      loadFavorites()
    } catch (error) {
      toast.error('Failed to remove favorite')
      console.error(error)
    }
  }

  const handleNavigateToItem = (favoriteType, favoriteId) => {
    if (favoriteType === 'restaurant') {
      navigate(`/restaurants/${favoriteId}`)
    } else if (favoriteType === 'menu_item') {
      navigate(`/restaurants?item=${favoriteId}`)
    }
  }

  const getFavoriteBadge = (type) => {
    return type === 'restaurant' ? '🏪' : '🍽️'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-surface-900">My Favorites</h1>
        <p className="mt-2 text-sm text-surface-500">Your saved restaurants and menu items</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilterType(null); setPage(0) }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterType === null
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilterType('restaurant'); setPage(0) }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterType === 'restaurant'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          🏪 Restaurants
        </button>
        <button
          onClick={() => { setFilterType('menu_item'); setPage(0) }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filterType === 'menu_item'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
          }`}
        >
          🍽️ Menu Items
        </button>
        <button
          onClick={loadFavorites}
          disabled={loading}
          className="ml-auto rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="rounded-3xl border border-surface-200 bg-white p-8 text-center text-sm text-surface-500">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
            <p>Loading favorites...</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
          <p className="text-lg font-medium text-surface-900">
            {filterType
              ? `No ${filterType === 'restaurant' ? 'restaurants' : 'menu items'} favorited yet`
              : 'No favorites saved yet'}
          </p>
          <p className="mt-2 text-sm text-surface-500">
            Browse restaurants and tap the heart icon to save your favorites.
          </p>
          <Link
            to="/restaurants"
            className="mt-6 inline-flex rounded-full bg-surface-900 px-5 py-3 text-sm font-semibold text-white hover:bg-surface-800 transition"
          >
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          {/* Favorites Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="group rounded-3xl border border-surface-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg">
                    {getFavoriteBadge(favorite.favorite_type)}
                  </span>
                  <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-600">
                    {favorite.favorite_type === 'restaurant' ? 'Restaurant' : 'Menu Item'}
                  </span>
                </div>
                <div
                  onClick={() => handleNavigateToItem(favorite.favorite_type, favorite.favorite_id)}
                  className="cursor-pointer"
                >
                  <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition line-clamp-2">
                    {favorite.favorite_id}
                  </h3>
                  <p className="mt-1 text-xs text-surface-500">
                    Saved on {new Date(favorite.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleNavigateToItem(favorite.favorite_type, favorite.favorite_id)}
                    className="flex-1 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="flex-1 rounded-full border border-surface-200 px-4 py-2 text-xs font-semibold text-surface-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <span className="text-sm text-surface-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}

          <p className="text-center text-xs text-surface-400">
            {total} favorite{total !== 1 ? 's' : ''} total
          </p>
        </>
      )}
    </div>
  )
}
