import { useLanguage } from '../i18n/LanguageContext'
import './Footer.css'

export default function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">🎓</span>
          <span className="footer-name">AbiturentTestMarkazi</span>
          <p>{f.tagline}</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>{f.services}</strong>
            <ul>
              <li><a href="#services">{f.s1}</a></li>
              <li><a href="#services">{f.s2}</a></li>
              <li><a href="#services">{f.s3}</a></li>
            </ul>
          </div>
          <div>
            <strong>{f.company}</strong>
            <ul>
              <li><a href="#about">{f.c1}</a></li>
              <li><a href="#steps">{f.c2}</a></li>
              <li><a href="#apply">{f.c3}</a></li>
            </ul>
          </div>
          <div>
            <strong>{f.contacts}</strong>
            <ul>
              <li>📞 +998 99 000-00-00</li>
              <li>✉️ info@atm.uz</li>
              <li>📍 Toshkent</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>{f.copy}</p>
        </div>
      </div>
    </footer>
  )
}
