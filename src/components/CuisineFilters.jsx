export default function CuisineFilters({ cuisines = [], selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button 
        className={`${selected === null 
          ? 'bg-brand-600 text-white hover:bg-brand-700' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        className="rounded px-4 py-2 text-sm font-medium transition-all duration-200"
        onClick={() => onChange(null)}
      >
        All
      </button>
      {cuisines.map((c) => (
        <button 
          key={c} 
          onClick={() => onChange(c)}
          className={`${selected === c 
            ? 'bg-brand-600 text-white hover:bg-brand-700' 
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          className="rounded px-4 py-2 text-sm font-medium transition-all duration-200"
        >
          {c}
        </button>
      ))}
    </div>
  )
}
