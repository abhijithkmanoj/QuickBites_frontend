import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import RestaurantCard from '../components/RestaurantCard'

export default function HomePage() {
  const handleDemoToast = () => {
    toast.success('Hungry? Explore top restaurants near you!')
  }

  return (
    <section className="space-y-8">
      <div className="card bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Craving something delicious?
            </h1>
            <p className="max-w-xl text-brand-50">
              Order food from the best local restaurants with easy delivery to your doorstep.
              Fresh, fast, and right to your door.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/restaurants" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
              Order now
            </Link>
            <button
              onClick={handleDemoToast}
              className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              How it works
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Browse Restaurants', desc: 'Explore top-rated restaurants near you.', to: '/restaurants' },
          { title: 'Track Orders', desc: 'Real-time updates from kitchen to door.', to: '/orders' },
          { title: 'Easy Checkout', desc: 'Fast and secure payments.', to: '/cart' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="card group">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 12a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V15a.75.75 0 0 1 .75-.75Zm9-6.75a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 1.5 0V8.25a.75.75 0 0 0-.75-.75Zm-18 0a.75.75 0 0 0-.75.75v2.25a.75.75 0 0 0 1.5 0V8.25a.75.75 0 0 0-.75-.75Z" />
                <path d="M5.47 5.47a.75.75 0 0 0 0 1.06l1.97 1.97a.75.75 0 0 0 1.06-1.06l-1.97-1.97a.75.75 0 0 0-1.06 0Zm12.06 1.06a.75.75 0 0 1 1.06 0l1.97 1.97a.75.75 0 1 1-1.06 1.06l-1.97-1.97a.75.75 0 0 1 0-1.06Z" />
                <path fillRule="evenodd" d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600">{item.title}</h3>
            <p className="mt-1 text-sm text-surface-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
