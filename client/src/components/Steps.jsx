import { useLanguage } from '../i18n/LanguageContext'
import './Steps.css'

export default function Steps() {
  const { t } = useLanguage()
  const s = t.steps

  return (
    <section className="steps" id="steps">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{s.title}</h2>
          <p className="section-sub">{s.subtitle}</p>
        </div>
        <div className="steps-grid">
          {s.items.map((step, i) => (
            <div className="step-item" key={i}>
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < s.items.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
