import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import FilterDropdown from './FilterDropdown'
import HeroCarousel from './HeroCarousel'
import ArizaForm from './ArizaForm'
import AIChat from './AIChat'
import API from '../config'
import './Intro.css'

const CONTINENT_IMAGES = {
  "Osiyo": "/asia_icon.png",
  "Yevropa": "/europe_icon.png",
  "Amerika": "/america_icon.png",
  "Avstraliya": "/australia_icon.png",
}

export default function Intro() {
  const { t } = useLanguage()
  const i = t.intro

  const [allUniversities, setAllUniversities] = useState([])
  const [guvohnoma, setGuvohnoma] = useState(false)
  const [selContinents, setSelContinents] = useState([])
  const [selCountries, setSelCountries]   = useState([])
  const [selCities, setSelCities]         = useState([])
  const [results, setResults]             = useState(null)

  useEffect(() => {
    fetch(`${API}/api/universities`)
      .then(r => r.json())
      .then(setAllUniversities)
      .catch(() => {})
  }, [])

  // Derive filter options from DB data
  const continentOptions = useMemo(() =>
    [...new Set(allUniversities.map(u => u.continent).filter(Boolean))].sort()
  , [allUniversities])

  const countryOptions = useMemo(() => {
    const base = selContinents.length
      ? allUniversities.filter(u => selContinents.includes(u.continent))
      : allUniversities
    return [...new Set(base.map(u => u.country).filter(Boolean))].sort()
  }, [allUniversities, selContinents])

  const cityOptions = useMemo(() => {
    let base = selContinents.length
      ? allUniversities.filter(u => selContinents.includes(u.continent))
      : allUniversities
    if (selCountries.length) base = base.filter(u => selCountries.includes(u.country))
    return [...new Set(base.map(u => u.city).filter(Boolean))].sort()
  }, [allUniversities, selContinents, selCountries])

  const handleContinentChange = (val) => {
    setSelContinents(val)
    setSelCountries([])
    setSelCities([])
    setResults(null)
  }

  const handleCountryChange = (val) => {
    setSelCountries(val)
    setSelCities([])
    setResults(null)
  }

  const handleCityChange = (val) => {
    setSelCities(val)
    setResults(null)
  }

  const handleShow = () => {
    const filtered = allUniversities.filter(u => {
      if (selContinents.length && !selContinents.includes(u.continent)) return false
      if (selCountries.length && !selCountries.includes(u.country)) return false
      if (selCities.length && !selCities.includes(u.city)) return false
      return true
    })
    setResults(filtered)
  }

  return (
    <section className="intro">
      <HeroCarousel />
      <img src="/MIT_img.png"      className="intro-deco intro-deco-left"         alt="" />
      <img src="/stanford_img.png" className="intro-deco intro-deco-top-right"    alt="" />
      <img src="/harvard_img.png"  className="intro-deco intro-deco-bottom-right" alt="" />
      <div className="intro-inner">
        <h1 className="intro-title">{i.title}</h1>
        <div className="filters">
          <FilterDropdown
            label={i.continent}
            options={continentOptions}
            selected={selContinents}
            onChange={handleContinentChange}
            images={CONTINENT_IMAGES}
          />
          <FilterDropdown
            label={i.country}
            options={countryOptions}
            selected={selCountries}
            onChange={handleCountryChange}
            searchable
          />
          <FilterDropdown
            label={i.city}
            options={cityOptions}
            selected={selCities}
            onChange={handleCityChange}
            searchable
          />
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button className="show-btn" onClick={handleShow}>{i.show}</button>
            <AIChat onSelectUniversity={name => {
              const found = allUniversities.filter(u => u.name === name)
              setResults(found)
              setTimeout(() => document.getElementById('xizmatlar')?.scrollIntoView({ behavior: 'smooth' }), 100)
            }} universities={allUniversities} />
          </div>
        </div>
      </div>

      <div id="xizmatlar" style={{position:'relative',top:'-80px'}} />
      {results !== null && (
        <div className="uni-results">
          <div className="uni-results-inner">
            <p className="uni-results-count">{results.length} ta universitet topildi</p>
            {results.length === 0 ? (
              <p className="uni-results-empty">Hech narsa topilmadi</p>
            ) : (
              <div className="uni-cards">
                {results.map(u => (
                  <div className="uni-card" key={u.id}>
                    <div className="uni-card-img">
                      <img
                        src={u.image_url ? `${API}${u.image_url}` : '/default_uni.jpg'}
                        alt={u.name}
                        onError={e => { e.target.style.display='none' }}
                      />
                    </div>
                    {u.contract_pdf && (
                      <a
                        href={`${API}${u.contract_pdf}`}
                        target="_blank"
                        rel="noreferrer"
                        className="uni-card-contract-badge"
                      >
                        📄 Shartnoma
                      </a>
                    )}
                    <div className="uni-card-body">
                      <h3 className="uni-card-name">{u.name}</h3>
                      <div className="uni-card-meta">
                        {u.continent && <span className="uni-tag">{u.continent}</span>}
                        {u.country   && <span className="uni-tag">{u.country}</span>}
                        {u.city      && <span className="uni-tag uni-tag-city">{u.city}</span>}
                      </div>
                      {(u.admission_start || u.admission_end) && (
                        <div className="uni-card-dates">
                          📅 {u.admission_start || '—'} → {u.admission_end || '—'}
                        </div>
                      )}
                      {(() => {
                        const req = u.requirements ? (() => { try { return JSON.parse(u.requirements) } catch { return [] } })() : []
                        const deg = u.degrees ? (() => { try { return JSON.parse(u.degrees) } catch { return [] } })() : []
                        const dir = u.directions ? (() => { try { return JSON.parse(u.directions) } catch { return [] } })() : []
                        return (
                          <>
                            {deg.length > 0 && (
                              <div className="uni-card-section">
                                <span className="uni-card-section-label">Daraja</span>
                                <div className="uni-card-tags">
                                  {deg.map(d => <span key={d} className="uni-card-tag uni-card-tag-deg">{d}</span>)}
                                </div>
                              </div>
                            )}
                            {dir.length > 0 && (
                              <div className="uni-card-section">
                                <span className="uni-card-section-label">Yo'nalishlar</span>
                                <div className="uni-card-tags">
                                  {dir[0] === '*'
                                    ? <span className="uni-card-tag uni-card-tag-dir">Barcha yo'nalishlar</span>
                                    : dir.map(d => <span key={d} className="uni-card-tag uni-card-tag-dir">{d}</span>)
                                  }
                                </div>
                              </div>
                            )}
                            {req.length > 0 && (
                              <div className="uni-card-section">
                                <span className="uni-card-section-label">Talablar</span>
                                <div className="uni-card-tags">
                                  {req.map(r => <span key={r} className="uni-card-tag uni-card-tag-req">{r}</span>)}
                                </div>
                              </div>
                            )}
                            <div className="uni-card-footer">
                              {u.grant === '1'
                                ? <span className="uni-card-grant">Grant mavjud</span>
                                : u.contract_fee
                                  ? <span className="uni-card-fee">💳 {u.contract_fee}</span>
                                  : null
                              }
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <section id="steps" className="steps-wrap">
      <div className="steps-section">
        <h2 className="steps-title">{t.steps.title}</h2>
        <div className="steps-timeline">
          {[
            { s: t.steps.items[0], icon: '💬' },
            { s: t.steps.items[1], icon: '📝' },
            { s: t.steps.items[2], icon: '📊' },
            { s: t.steps.items[3], icon: '📋' },
            { s: t.steps.items[4], icon: '🏆' },
            { s: t.steps.items[5], icon: '🤝' },
          ].map(({ s, icon }) => (
            <div className="steps-item" key={s.num}>
              <div className="steps-circle">{icon}</div>
              <div className="steps-card">
                <p className="steps-card-title">{s.title}</p>
                <p className="steps-card-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>

      {(() => { const years = new Date().getFullYear() - 2019; return (
      <section id="about" className="about-wrap">
        <h2 className="about-title">{t.about.title}</h2>
        <p className="about-subtitle">2019 yildan beri, {years} yillik tajriba</p>
        <div className="about-grid">
          <div className="about-text">
            <p dangerouslySetInnerHTML={{ __html: t.about.p1 }} />
            <p>{t.about.p2}</p>
            <button className="guvohnoma-btn" onClick={() => setGuvohnoma(true)}>
              📄 Guvohnomani ko'rish
            </button>
            <div className="about-contact-card">
              <p className="about-contact-label">Bog'lanish uchun</p>
              <a href="tel:+998770168888" className="about-phone">📞 +998 77 016-88-88</a>
              <a href="tel:+998503029999" className="about-phone">📞 +998 50 302-99-99</a>
              <a href="https://t.me/testmarkaziadmin" target="_blank" rel="noreferrer" className="about-phone"><img src="/icons8-telegram-logo-94.png" className="tg-icon" alt="" /> @testmarkaziadmin</a>
              <a href="https://t.me/ATX_UZ" target="_blank" rel="noreferrer" className="about-phone"><img src="/icons8-telegram-logo-94.png" className="tg-icon" alt="" /> Telegram kanal</a>
            </div>
          </div>
          <div className="about-right">
            <div className="about-stats">
              <div className="about-stat"><span className="about-stat-n">1500+</span><span className="about-stat-l">Qabul qilingan talabalar</span></div>
              <div className="about-stat"><span className="about-stat-n">98%</span><span className="about-stat-l">Muvaffaqiyatli holatlar</span></div>
              <div className="about-stat"><span className="about-stat-n">{years}</span><span className="about-stat-l">Yillik tajriba</span></div>
              <div className="about-stat"><span className="about-stat-n">90+</span><span className="about-stat-l">Hamkor universitetlar</span></div>
            </div>
            <iframe
              className="about-map"
              src="https://maps.google.com/maps?q=38.833519,65.793731&z=15&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
      ); })()}

      <section id="apply" className="ariza-section">
        <div className="ariza-section-inner">
          <h2 className="ariza-section-title">{t.ariza.title}</h2>
          <div className="ariza-section-form">
            <ArizaForm universities={allUniversities} />
          </div>
        </div>
      </section>

      {guvohnoma && (
        <div className="guv-overlay" onClick={() => setGuvohnoma(false)}>
          <div className="guv-modal" onClick={e => e.stopPropagation()}>
            <button className="guv-close" onClick={() => setGuvohnoma(false)}>✕</button>
            <img src="/guvohnoma.jpg" alt="Guvohnoma" className="guv-img" />
          </div>
        </div>
      )}
    </section>
  )
}
