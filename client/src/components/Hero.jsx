import { useLanguage } from '../i18n/LanguageContext'
import './Hero.css'

export default function Hero() {
  const { t } = useLanguage()
  const h = t.hero

  return (
    <section className="hero" id="home">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="hero-badge">{h.badge}</span>
          <h1>{h.title}</h1>
          <p className="hero-desc">{h.desc}</p>
          <div className="hero-actions">
            <a href="#apply" className="btn btn-primary">{h.btnPrimary}</a>
            <a href="#steps" className="btn btn-outline">{h.btnSecondary}</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>{h.stat1.value}</strong><span>{h.stat1.label}</span></div>
            <div className="stat"><strong>{h.stat2.value}</strong><span>{h.stat2.label}</span></div>
            <div className="stat"><strong>{h.stat3.value}</strong><span>{h.stat3.label}</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="card-icon">🎓</div>
            <p className="card-title">{h.cardTitle}</p>
            <p className="card-sub">{h.cardSub}</p>
            <ul className="card-list">
              {h.cardList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <a href="#apply" className="btn btn-primary" style={{width:'100%',textAlign:'center',marginTop:'16px'}}>
              {h.cardBtn}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
