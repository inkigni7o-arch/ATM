import { useState, useRef, useEffect } from 'react'
import './FilterDropdown.css'

export default function FilterDropdown({ label, options, selected, onChange, images, searchable }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (!open) setQuery('') }, [open])

  const isAll = selected.length === 0

  const toggleAll = () => onChange([])

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  const displayText = isAll
    ? label
    : images
      ? null
      : selected.join(', ')

  return (
    <div className="fdd" ref={ref}>
      <button
        className={`fdd-trigger ${open ? 'open' : ''} ${!isAll ? 'has-value' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {!isAll && images ? (
          <div className="fdd-images">
            {selected.map(name => images[name]
              ? <img key={name} src={images[name]} alt={name} className="fdd-thumb" />
              : <span key={name} className="fdd-text-item">{name}</span>
            )}
          </div>
        ) : (
          <span className="fdd-display">{displayText || label}</span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div className="fdd-menu">
          {searchable && (
            <div className="fdd-search-wrap">
              <input
                className="fdd-search"
                placeholder="Qidirish..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <label className={`fdd-item fdd-item-all ${isAll ? 'checked' : ''}`}>
            <input type="checkbox" checked={isAll} onChange={toggleAll} />
            <span>Barchasi</span>
          </label>
          <div className="fdd-divider" />
          {options.filter(opt => !query || opt.toLowerCase().includes(query.toLowerCase())).map(opt => (
            <label key={opt} className={`fdd-item ${selected.includes(opt) ? 'checked' : ''}`}>
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {images?.[opt] && <img src={images[opt]} alt={opt} className="fdd-item-img" />}
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
