import { useState, useEffect } from 'react'
import API from '../config'
import './HeroCarousel.css'

export default function HeroCarousel() {
  const [slides, setSlides] = useState([])

  useEffect(() => {
    fetch(`${API}/api/widgets`)
      .then(r => r.json())
      .then(imgs => setSlides(imgs.map(i => `${API}${i.url}`)))
      .catch(() => {})
  }, [])

  if (slides.length === 0) return null

  const doubled = [...slides, ...slides]

  return (
    <div className="hero-carousel">
      <div className="hero-carousel-track">
        {doubled.map((src, i) => (
          <img key={i} src={src} alt="" className="hero-carousel-slide" />
        ))}
      </div>
    </div>
  )
}
