import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import RestaurantCard from '../components/RestaurantCard'
import DealBanner from '../components/promotions/DealBanner'

export default function HomePage() {
  const handleDemoToast = () => {
    toast.success('Hungry? Explore top restaurants near you!')
  }

  return (
    <section className="space-y-12">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2240%22 viewBox=%220 0 60 40%22><path fill=%22%23ffffff%22 fill-opacity=%220.05%22 d=%22M0 0h60v40H0z%22/%22>')]"></div>
        </div>
        <div className="relative z-10 py-20 md:py-24 text-white">
          <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-6">
              Craving something delicious?
            </h1>
            <p className="text-xl text-brand-50 max-w-2xl mx-auto mb-8">
              Order food from the best local restaurants with easy delivery to your doorstep.
              Fresh, fast, and right to your door.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-4">
              <Link to="/restaurants" 
                className="flex-1 px-6 py-3 bg-white text-brand-700 font-medium rounded-xl 
                           hover:bg-brand-50 transition-transform transform hover:-translate-y-1 
                           shadow-lg hover:shadow-xl">
                Order now
              </Link>
              <button
                onClick={handleDemoToast}
                className="flex-1 px-6 py-3 border border-white/20 bg-white/10 text-white font-medium 
                           rounded-xl hover:bg-white/20 transition-transform transform hover:-translate-y-1"
              >
                How it works
              </button>
            </div>
          </div>
        </div>
      </div>
        <DealBanner />

        {/* Features Section */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-surface-900 mb-10">
            Why choose QuickBites?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: 'Browse Restaurants', 
                desc: 'Explore top-rated restaurants near you.', 
                icon: '🍴'
              },
              { 
                title: 'Track Orders', 
                desc: 'Real-time updates from kitchen to door.', 
                icon: '📍'
              },
              { 
                title: 'Easy Checkout', 
                desc: 'Fast and secure payments.', 
                icon: '💳'
              },
            ].map((item, i) => (
              <div key={item.title} className="group rounded-2xl bg-white p-6 shadow-soft hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center mb-4 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors duration-300">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
        <div className="relative z-10 py-16">
          <div className="mx-auto max-w-2xl px-4 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-surface-900 mb-6">
              Ready to order your favorite meal?
            </h2>
            <p className="text-lg text-surface-500 mb-8">
              Join thousands of satisfied customers enjoying food delivery made easy.
            </p>
            <Link to="/restaurants" 
              className="inline-flex px-8 py-3 bg-brand-600 text-white font-medium 
                         rounded-xl hover:bg-brand-700 transition-transform transform 
                         hover:-translate-y-1 shadow-lg hover:shadow-xl">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
