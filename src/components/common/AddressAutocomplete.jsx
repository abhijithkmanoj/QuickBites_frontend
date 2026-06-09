import React, { useEffect, useRef, useState } from "react";
import apiClient from '../../lib/axios'

export default function AddressAutocomplete({ onAddressSelect, placeholder = "Enter address", defaultValue = "" }) {
  const [input, setInput] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await apiClient.get('/places/autocomplete', { params: { input } })
        const data = resp.data || {}
        const preds = data.predictions || []
        setSuggestions(preds);
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [input]);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  async function selectSuggestion(s) {
    setInput(s.description || "");
    setOpen(false);
    
    // Return the selection with minimal required data
    // User will need to manually fill in missing fields if backend endpoints are unavailable
    const out = {
      description: s.description || "",
      place_id: String(s.place_id || ""),
      formatted_address: s.description || "",
      // Other fields will be filled manually by user or left empty
    };
    
    if (onAddressSelect) onAddressSelect(out);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not available in this browser.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      // Use basic reverse geocoding or just show coordinates
      const formatted = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      setInput(formatted);
      if (onAddressSelect) onAddressSelect({ 
        latitude: lat, 
        longitude: lng, 
        formatted_address: formatted,
        place_id: "" 
      });
    }, (err) => {
      console.error(err);
      alert("Unable to get your location.");
    });
  }

  function onKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <button type="button" onClick={() => { setInput(""); setSuggestions([]); setOpen(false); }} className="text-sm text-gray-600">Clear</button>
        <button type="button" onClick={useMyLocation} className="text-sm text-blue-600">Use my location</button>
      </div>

      {open && (
        <ul className="absolute z-40 mt-1 w-full bg-white border rounded max-h-56 overflow-auto shadow" role="listbox">
          {loading && <li className="p-2 text-sm text-gray-500">Loading…</li>}
          {!loading && suggestions.length === 0 && <li className="p-2 text-sm text-gray-500">No results</li>}
          {!loading && suggestions.map((s, idx) => (
            <li
              key={s.place_id || idx}
              role="option"
              aria-selected={activeIndex === idx}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${activeIndex === idx ? 'bg-gray-100' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="text-sm">{s.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
