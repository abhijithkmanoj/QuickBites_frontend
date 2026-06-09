export default function CuisineFilters({ cuisines = [], selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button 
        className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          selected === null 
            ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' 
            : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-navy-700'
        }`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {cuisines.map((c) => (
        <button 
          key={c} 
          onClick={() => onChange(c)}
          className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            selected === c 
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600' 
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-navy-700'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
