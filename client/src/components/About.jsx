import { useLanguage } from '../i18n/LanguageContext'
import './About.css'

export default function About() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <section className="about" id="about">
      <div className="container about-inner">
        <div className="about-text">
          <h2 className="section-title">{a.title}</h2>
          <p dangerouslySetInnerHTML={{ __html: a.p1 }} />
          <p>{a.p2}</p>
          <div className="about-features">
            {a.features.map((f, i) => (
              <div className="feature" key={i}>
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="about-numbers">
          {a.stats.map((item, i) => (
            <div className="about-num-card" key={i}>
              <strong>{item.n}</strong>
              <span>{item.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
