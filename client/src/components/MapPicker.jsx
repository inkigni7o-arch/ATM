import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapPicker({ value, onChange }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (mapInstanceRef.current) return
    const map = L.map(mapRef.current, { center: [41.2995, 69.2401], zoom: 12 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    map.on('click', e => {
      placeMarker(map, e.latlng.lat, e.latlng.lng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    mapInstanceRef.current = map

    if (value) {
      setSearch(value)
      geocodeAndPlace(map, value)
    }

    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  const placeMarker = (map, lat, lng) => {
    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng]).addTo(map)
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru`)
      const data = await res.json()
      const addr = data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setSearch(addr)
      onChange(addr)
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setSearch(addr)
      onChange(addr)
    }
  }

  const geocodeAndPlace = async (map, query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=uz`)
      const data = await res.json()
      if (data[0]) {
        const { lat, lon } = data[0]
        map.setView([lat, lon], 15)
        placeMarker(map, parseFloat(lat), parseFloat(lon))
      }
    } catch {}
  }

  const handleSearch = async e => {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true)
    await geocodeAndPlace(mapInstanceRef.current, search)
    onChange(search)
    setSearching(false)
  }

  return (
    <div className="map-picker">
      <form className="map-search-row" onSubmit={handleSearch}>
        <input
          className="map-search-input"
          value={search}
          onChange={e => { setSearch(e.target.value); onChange(e.target.value) }}
          placeholder="Manzilni kiriting yoki xaritadan tanlang..."
        />
        <button type="submit" className="map-search-btn" disabled={searching}>
          {searching ? '...' : 'Qidirish'}
        </button>
      </form>
      <div ref={mapRef} className="map-container" />
    </div>
  )
}
