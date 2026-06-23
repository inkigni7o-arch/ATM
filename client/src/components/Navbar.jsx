import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import './Navbar.css'

const LANGS = ['uz', 'ru', 'en']

const CTA_TITLE = { uz: "Biz bilan bog'laning", ru: "Свяжитесь с нами", en: "Contact Us" }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [ctaOpen, setCtaOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()

  const links = [
    { href: '#xizmatlar', label: t.nav.services },
    { href: '#steps', label: t.nav.howWeWork },
    { href: '#about', label: t.nav.about },
    { href: '#apply', label: t.nav.apply },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <a href="#" className="logo">
            <img src="/logo.png" alt="ATM Logo" className="logo-img" />
            <span>AbiturentTestMarkazi</span>
          </a>
          <ul className={`nav-links ${open ? 'open' : ''}`}>
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
              </li>
            ))}
            <li>
              <button className="btn btn-primary nav-cta" onClick={() => { setCtaOpen(true); setOpen(false) }}>
                {t.nav.cta}
              </button>
            </li>
          </ul>
          <div className="nav-right">
            <div className="lang-switcher">
              {LANGS.map(l => (
                <button
                  key={l}
                  className={`lang-btn ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {ctaOpen && (
        <div className="cta-overlay" onClick={() => setCtaOpen(false)}>
          <div className="cta-modal" onClick={e => e.stopPropagation()}>
            <button className="cta-modal-close" onClick={() => setCtaOpen(false)}>×</button>
            <h3 className="cta-modal-title">{CTA_TITLE[lang]}</h3>
            <div className="cta-modal-contacts">
              <div className="cta-contact-group">
                <p className="cta-contact-label">Telefon raqamimiz</p>
                <a href="tel:+998770168888" className="cta-contact-item">+998 77 016-88-88</a>
                <a href="tel:+998503029999" className="cta-contact-item">+998 50 302-99-99</a>
              </div>
              <div className="cta-contact-group">
                <p className="cta-contact-label">Adminlarimiz Telegram</p>
                <a href="https://t.me/testmarkaziadmin" target="_blank" rel="noreferrer" className="cta-contact-item">@testmarkaziadmin</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
