import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import DealBanner from '../components/promotions/DealBanner'

export default function HomePage() {
  const handleDemoToast = () => {
    toast.success('Hungry? Explore top restaurants near you!')
  }

  return (
    <section className="space-y-16">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 mb-8">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-sm text-white/80">Now delivering in your area</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight lg:text-6xl xl:text-7xl mb-6 text-balance">
              <span className="text-white">Craving something </span>
              <span className="text-gradient bg-gradient-to-r from-brand-300 via-amber-300 to-brand-400">delicious</span>
              <span className="text-white">?</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Order food from the best local restaurants with easy delivery to your doorstep.
              Fresh, fast, and right where you are.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-4 max-w-md mx-auto">
              <Link to="/restaurants" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-amber-500 text-white font-semibold rounded-xl 
                           transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-1 active:scale-[0.98]">
                <span>Order Now</span>
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <button
                onClick={handleDemoToast}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 bg-white/5 text-white font-semibold rounded-xl 
                           transition-all duration-300 hover:bg-white/10 hover:border-white/30 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How it Works
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <DealBanner />

      {/* Premium Features Section */}
      <section className="py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/50 px-4 py-1.5 mb-4">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Why Choose Us</span>
          </div>
          <h2 className="text-3xl font-bold text-navy-900 mb-3">Everything you need, delivered</h2>
          <p className="text-surface-500 max-w-xl mx-auto">
            We make ordering food effortless with features designed for your convenience.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            { 
              title: 'Browse Restaurants', 
              desc: 'Explore top-rated restaurants and cuisines near you with detailed menus and reviews.', 
              icon: '🍴',
              gradient: 'from-brand-50 to-amber-50',
              iconBg: 'from-brand-500 to-amber-500'
            },
            { 
              title: 'Live Order Tracking', 
              desc: 'Real-time updates from kitchen to your doorstep. Know exactly when your food arrives.', 
              icon: '📍',
              gradient: 'from-emerald-50 to-teal-50',
              iconBg: 'from-emerald-500 to-teal-500'
            },
            { 
              title: 'Seamless Checkout', 
              desc: 'Fast and secure payments with multiple options. Save your addresses for quick ordering.', 
              icon: '💳',
              gradient: 'from-navy-50 to-indigo-50',
              iconBg: 'from-navy-600 to-indigo-600'
            },
          ].map((item) => (
            <div key={item.title} className="group relative overflow-hidden rounded-2xl bg-white border border-surface-200/70 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`flex h-14 w-14 items-center justify-center mb-5 rounded-2xl bg-gradient-to-br ${item.iconBg} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to order your favorite meal?</h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            Join thousands of satisfied customers enjoying food delivery made easy.
          </p>
          <Link to="/restaurants" 
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-navy-900 font-bold rounded-xl 
                       transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 active:scale-[0.98]">
            Browse Restaurants
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </section>
  )
}
