import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
      navigate(`/restaurant/${favoriteId}`)
    } else if (favoriteType === 'menu_item') {
      navigate(`/menu-item/${favoriteId}`)
    }
  }

  const getFavoriteBadge = (type) => {
    return type === 'restaurant' ? '🏪' : '🍽️'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Favorites</h1>
          <p className="text-slate-600">Your saved restaurants and menu items</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => { setFilterType(null); setPage(0) }}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === null
                ? 'bg-brand-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilterType('restaurant'); setPage(0) }}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'restaurant'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            🏪 Restaurants
          </button>
          <button
            onClick={() => { setFilterType('menu_item'); setPage(0) }}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'menu_item'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            🍽️ Menu Items
          </button>
          <button
            onClick={loadFavorites}
            disabled={loading}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition ml-auto"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 text-lg">
                {filterType
                  ? `No ${filterType === 'restaurant' ? 'restaurants' : 'menu items'} favorited yet`
                  : 'No favorites saved yet'}
              </p>
              <p className="text-slate-400 mt-2">
                Start by adding restaurants or menu items to your favorites!
              </p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-lg transition cursor-pointer group"
              >
                <div
                  onClick={() =>
                    handleNavigateToItem(favorite.favorite_type, favorite.favorite_id)
                  }
                  className="mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">
                      {getFavoriteBadge(favorite.favorite_type)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {favorite.favorite_type === 'restaurant' ? 'Restaurant' : 'Menu Item'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition line-clamp-2">
                    {favorite.favorite_id}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Saved {new Date(favorite.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleNavigateToItem(favorite.favorite_type, favorite.favorite_id)
                    }
                    className="flex-1 px-3 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex gap-2 justify-center items-center">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-slate-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Total Count */}
        <div className="mt-8 text-center text-slate-600">
          <p>{total} total favorite{total !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </div>
  )
}
