import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapDisplay({ address }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!instanceRef.current) {
      const map = L.map(mapRef.current, { center: [41.2995, 69.2401], zoom: 12, zoomControl: true, scrollWheelZoom: false })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      instanceRef.current = map
    }
    if (address) geocode(address)
    return () => {}
  }, [address])

  const geocode = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Uzbekistan')}&format=json&limit=1`)
      const data = await res.json()
      if (data[0]) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        if (markerRef.current) markerRef.current.remove()
        markerRef.current = L.marker([lat, lon]).addTo(instanceRef.current)
        instanceRef.current.setView([lat, lon], 15)
      }
    } catch {}
  }

  useEffect(() => {
    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null } }
  }, [])

  return <div ref={mapRef} style={{ height: '180px', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' }} />
}
