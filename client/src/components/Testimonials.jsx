import { useLanguage } from '../i18n/LanguageContext'
import './Testimonials.css'

export default function Testimonials() {
  const { t } = useLanguage()
  const tm = t.testimonials

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{tm.title}</h2>
          <p className="section-sub">{tm.subtitle}</p>
        </div>
        <div className="reviews-grid">
          {tm.items.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="stars">{'★'.repeat(r.stars)}</div>
              <p className="review-text">"{r.text}"</p>
              <div className="reviewer">
                <div className="reviewer-avatar">{r.name[0]}</div>
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.university}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
