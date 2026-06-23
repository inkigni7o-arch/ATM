import { useLanguage } from '../i18n/LanguageContext'
import './Services.css'

export default function Services() {
  const { t } = useLanguage()
  const s = t.services

  return (
    <section className="services" id="services">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{s.title}</h2>
          <p className="section-sub">{s.subtitle}</p>
        </div>
        <div className="services-grid">
          {s.items.map((item, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
