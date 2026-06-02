export default function CuisineFilters({ cuisines = [], selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className={`rounded px-3 py-1 text-sm ${selected === null ? 'bg-slate-900 text-white' : 'bg-slate-100'}`} onClick={() => onChange(null)}>All</button>
      {cuisines.map((c) => (
        <button key={c} onClick={() => onChange(c)} className={`rounded px-3 py-1 text-sm ${selected === c ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
          {c}
        </button>
      ))}
    </div>
  )
}
