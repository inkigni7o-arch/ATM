import { useState, useRef, useEffect, useCallback } from 'react'
import API from '../config'
import MapDisplay from './MapDisplay'
import { useLanguage } from '../i18n/LanguageContext'
import { VILOYATLAR, getShaharlar } from '../data/uzbekistan'
import './ArizaForm.css'

const INITIAL = {
  name: '', last_name: '', phone: '', passport: '', jshshr: '',
  viloyat: '', shahar: '', street: '', street2: '', direction: '', lang: '',
  school: '', uni1: '', uni2: '', uni3: '', grade: ''
}

function UniSearch({ value, onChange, universities, placeholder }) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = universities.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  const select = name => { onChange(name); setQuery(name); setOpen(false) }
  const clear = () => { onChange(''); setQuery(''); setOpen(false) }

  return (
    <div className="uni-search-wrap" ref={ref}>
      <div className="uni-search-input-wrap">
        <input
          className="ariza-input"
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
        />
        {query && <button type="button" className="uni-search-clear" onClick={clear}>✕</button>}
      </div>
      {open && filtered.length > 0 && (
        <ul className="uni-search-list">
          {filtered.map(u => (
            <li key={u.id} className="uni-search-item" onMouseDown={() => select(u.name)}>
              {u.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchSelect({ options, value, onChange, placeholder, disabled }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
  const select = v => { onChange(v); setQuery(''); setOpen(false) }
  const clear = () => { onChange(''); setQuery(''); setOpen(false) }

  return (
    <div className="uni-search-wrap" ref={ref}>
      <div className="uni-search-input-wrap">
        <input
          className="ariza-input"
          value={open ? query : value}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { if (!disabled) setOpen(true) }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!open}
        />
        {value && !open && <button type="button" className="uni-search-clear" onClick={clear}>✕</button>}
      </div>
      {open && filtered.length > 0 && (
        <ul className="uni-search-list">
          {filtered.map(v => (
            <li key={v} className="uni-search-item" onMouseDown={() => select(v)}>{v}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ArizaForm({ universities = [] }) {
  const { t } = useLanguage()
  const f = t.ariza
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('ariza_draft')
      return saved ? { ...INITIAL, ...JSON.parse(saved) } : INITIAL
    } catch { return INITIAL }
  })
  const [status, setStatus] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [serviceType, setServiceType] = useState('')
  const [showCard, setShowCard] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [paying, setPaying] = useState(false)
  const [formError, setFormError] = useState('')
  const [payError, setPayError] = useState('')
  const [cardError, setCardError] = useState('')
  const [settings, setSettings] = useState({ price_support: 415000, price_contract: 18500000 })
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(data => setSettings(s => ({ ...s, ...data }))).catch(() => {})
    fetch(`${API}/api/tests`).then(r => r.json()).then(setTests).catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem('ariza_draft', JSON.stringify(form))
  }, [form])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleViloyat = v => setForm(p => ({ ...p, viloyat: v, shahar: '' }))

  const handleContinue = e => {
    e.preventDefault()
    if (!form.name)      { setFormError(f.errName); return }
    if (!form.last_name) { setFormError(f.errLastName); return }
    if (!form.passport)  { setFormError(f.errPassport); return }
    if (!form.jshshr)    { setFormError(f.errJshshr); return }
    if (!form.phone)     { setFormError(f.errPhone); return }
    if (!form.viloyat)   { setFormError(f.errViloyat); return }
    if (!form.shahar)    { setFormError(f.errShahar); return }
    if (!form.street)    { setFormError(f.errStreet); return }
    if (!form.school)    { setFormError(f.errSchool); return }
    if (!form.grade)     { setFormError(f.errGrade); return }
    if (!form.direction) { setFormError(f.errDirection); return }
    if (!form.uni1)      { setFormError(f.errUni1); return }
    if (!form.uni2)      { setFormError(f.errUni2); return }
    if (!form.uni3)      { setFormError(f.errUni3); return }
    if (!form.lang)      { setFormError(f.errLang); return }
    setFormError('')
    setShowPayment(true)
  }

  const handleSubmit = async () => {
    setStatus('loading')
    try {
      const res = await fetch(`${API}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setShowPayment(false)
      setStatus('success')
      setForm(INITIAL)
      localStorage.removeItem('ariza_draft')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div className="ariza-success">
      <div className="ariza-success-icon">🎉</div>
      <h3>{f.successTitle}</h3>
      <p>{f.successDesc}</p>
      <button onClick={() => setStatus(null)}>{f.successBtn}</button>
    </div>
  )

  return (
    <>
    {showPayment && (
      <div className="payment-overlay" onClick={() => setShowPayment(false)}>
        <div className="payment-modal" onClick={e => e.stopPropagation()}>
          <button className="payment-close" onClick={() => setShowPayment(false)}>✕</button>
          <div className="payment-service-tabs">
            <button
              type="button"
              className={`payment-service-tab ${serviceType === 'support' ? 'active' : ''}`}
              onClick={() => setServiceType('support')}
            >
              <span className="pst-label">{f.payTab1}</span>
              <span className="pst-price">{settings.price_support.toLocaleString('ru-RU')} {f.paySum}</span>
            </button>
            <button
              type="button"
              className={`payment-service-tab ${serviceType === 'contract' ? 'active' : ''}`}
              onClick={() => setServiceType('contract')}
            >
              <span className="pst-label">{f.payTab2}</span>
              <span className="pst-price">{settings.price_contract.toLocaleString('ru-RU')} {f.paySum}</span>
            </button>
          </div>

          <div className="payment-body">
            {serviceType === 'support' && (
              <>
                <div className="payment-info-text">
                  {f.payInfoText(settings.price_support.toLocaleString('ru-RU')).split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
                </div>
                <div className="payment-two-col">
                  <div className="payment-left">
                    <div className="payment-col-title">{f.paySelectDate}</div>
                    {tests.length === 0 ? (
                      <p className="payment-no-tests">{f.payNoTests}</p>
                    ) : (
                      <select
                        className="payment-date-select"
                        value={selectedTest?.id || ''}
                        onChange={e => setSelectedTest(tests.find(t => t.id === Number(e.target.value)) || null)}
                      >
                        <option value="">{f.paySelectOption}</option>
                        {tests.map(t => (
                          <option key={t.id} value={t.id}>
                            {(() => { const d = new Date(t.test_date); return `${d.getDate()} ${f.months[d.getMonth()]} ${d.getFullYear()}`; })()}
                          </option>
                        ))}
                      </select>
                    )}
                    {selectedTest && (
                      <div className="payment-test-detail">
                        <div className="ptd-row"><b>{f.payTime}:</b> <span>{selectedTest.test_time}</span></div>
                        <div className="ptd-row"><b>{f.payAddress}:</b> <span>{selectedTest.test_address}</span></div>
                        <MapDisplay address={selectedTest.test_address} />
                      </div>
                    )}
                  </div>
                  <div className="payment-right">
                    <div className="payment-col-title">{f.payTestContent}</div>
                    <div className="payment-subject-blocks">
                      <div className="payment-subjects-row">
                        <div className="payment-subject">
                          <span className="ps-name">{f.payMath || 'Matematika'}</span>
                          <span className="ps-score">max 50 ball</span>
                        </div>
                        <div className="payment-subject">
                          <span className="ps-name">{f.payEnglish || 'Ingliz tili'}</span>
                          <span className="ps-score">max 50 ball</span>
                        </div>
                      </div>
                      <div className="payment-subject">
                        <span className="ps-name">{f.payPsych || 'Psixologik intervyu'}</span>
                        <span className="ps-score">max 100 ball</span>
                      </div>
                    </div>
                    <div className="payment-passing">
                      <span>{f.payPassing}</span>
                      <span className="pp-score">150 ball</span>
                    </div>
                    <div className="payment-pay-wrap">
                      {status === 'error' && <p className="ariza-error">{f.error}</p>}
                      {payError && <p className="ariza-error">{payError}</p>}
                      <button className="payment-pay-btn" onClick={() => {
                        if (!serviceType) { setPayError(f.payErrService); return }
                        if (serviceType === 'support' && !selectedTest) { setPayError(f.payErrDate); return }
                        setPayError('')
                        setShowCard(true)
                      }}>
                        {f.payBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {serviceType === 'contract' && (
              <div className="contract-tab">
                <p className="contract-dev-note">{f.payContractDev}</p>
                {status === 'error' && <p className="ariza-error">{f.error}</p>}
                {payError && <p className="ariza-error">{payError}</p>}
                <div className="contract-bottom-row">
                  <div className="contract-price-block">
                    <span className="contract-price-label">{f.payTotalLabel}</span>
                    <span className="contract-price-val">{settings.price_contract.toLocaleString('ru-RU')} {f.paySum}</span>
                  </div>
                  <button className="payment-pay-btn contract-pay-btn" onClick={() => {
                    setPayError('')
                    setShowCard(true)
                  }}>
                    {f.payBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="payment-actions"></div>
        </div>
      </div>
    )}
    {showCard && (
      <div className="card-overlay" onClick={() => setShowCard(false)}>
        <div className="card-modal" onClick={e => e.stopPropagation()}>
          <button className="payment-close" onClick={() => setShowCard(false)}>✕</button>
          <p className="card-modal-label">{f.cardNum}</p>
          <input
            className="card-input"
            value={card.number}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 16)
              setCard(p => ({ ...p, number: v.replace(/(.{4})/g, '$1 ').trim() }))
            }}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
          />
          <div className="card-row">
            <div className="card-field">
              <p className="card-modal-label">{f.cardExpiry}</p>
              <input
                className="card-input"
                value={card.expiry}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                  if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2)
                  setCard(p => ({ ...p, expiry: v }))
                }}
                placeholder="MM/YY"
                inputMode="numeric"
              />
            </div>
            <div className="card-field">
              <p className="card-modal-label">{f.cardCvv}</p>
              <input
                className="card-input"
                value={card.cvv}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 3)
                  setCard(p => ({ ...p, cvv: v }))
                }}
                placeholder="***"
                inputMode="numeric"
                type="password"
              />
            </div>
          </div>
          {cardError && <p className="card-error">{cardError}</p>}
          <button
            className="card-pay-btn"
            disabled={paying}
            onClick={async () => {
              const num = card.number.replace(/\s/g, '')
              if (num.length < 16) { setCardError(f.cardErrNum); return }
              if (card.expiry.length < 5) { setCardError(f.cardErrExpiry); return }
              if (card.cvv.length < 3) { setCardError(f.cardErrCvv); return }
              setCardError('')
              setPaying(true)
              await handleSubmit()
              setPaying(false)
              setShowCard(false)
            }}
          >
            {paying ? f.cardPaying : f.cardPay}
          </button>
        </div>
      </div>
    )}
    <form className="ariza-form" onSubmit={handleContinue}>
      <div className="ariza-field">
        <label className="ariza-label">{f.name} <span>*</span></label>
        <input className="ariza-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={f.namePh} required />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.lastName}</label>
        <input className="ariza-input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder={f.lastNamePh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.passport} <span>*</span></label>
        <input
          className="ariza-input"
          value={form.passport}
          onChange={e => {
            const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
            if (v.length <= 9) set('passport', v)
          }}
          placeholder={f.passportPh}
          required
        />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.jshshr} <span>*</span></label>
        <input
          className="ariza-input"
          value={form.jshshr}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '')
            if (v.length <= 14) set('jshshr', v)
          }}
          placeholder={f.jshshrPh}
          inputMode="numeric"
          required
        />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.phone} <span>*</span></label>
        <div className="phone-wrap">
          <span className="phone-prefix">+998</span>
          <input
            className="ariza-input phone-input"
            value={form.phone}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '')
              if (v.length <= 9) set('phone', v)
            }}
            placeholder="901234567"
            inputMode="numeric"
            required
          />
        </div>
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.viloyat}</label>
        <SearchSelect
          options={VILOYATLAR}
          value={form.viloyat}
          onChange={handleViloyat}
          placeholder={f.viloyatPh}
        />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.shahar}</label>
        <SearchSelect
          options={getShaharlar(form.viloyat)}
          value={form.shahar}
          onChange={v => set('shahar', v)}
          placeholder={form.viloyat ? f.shaharPh : f.shaharDis}
          disabled={!form.viloyat}
        />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.mahalla}</label>
        <input
          className="ariza-input"
          value={form.street}
          onChange={e => set('street', e.target.value)}
          placeholder={form.shahar ? f.mahallaPh : f.mahallaDis}
          disabled={!form.shahar}
        />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.kocha}</label>
        <input className="ariza-input" value={form.street2} onChange={e => set('street2', e.target.value)} placeholder={f.kochaPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.maktab}</label>
        <input className="ariza-input" value={form.school} onChange={e => set('school', e.target.value)} placeholder={f.maktabPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.sinf}</label>
        <div className="ariza-chips">
          {f.grades.map(g => (
            <button type="button" key={g}
              className={`ariza-chip ${form.grade === g ? 'active' : ''}`}
              onClick={() => set('grade', form.grade === g ? '' : g)}
            >{g}</button>
          ))}
        </div>
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.mutaxassislik}</label>
        <input className="ariza-input" value={form.direction} onChange={e => set('direction', e.target.value)} placeholder={f.mutaxassislikPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.uni1}</label>
        <UniSearch value={form.uni1} onChange={v => set('uni1', v)} universities={universities} placeholder={f.uniPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.uni2}</label>
        <UniSearch value={form.uni2} onChange={v => set('uni2', v)} universities={universities} placeholder={f.uniPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.uni3}</label>
        <UniSearch value={form.uni3} onChange={v => set('uni3', v)} universities={universities} placeholder={f.uniPh} />
      </div>

      <div className="ariza-field">
        <label className="ariza-label">{f.suhbatTili}</label>
        <div className="ariza-chips">
          {f.langs.map(l => (
            <button type="button" key={l}
              className={`ariza-chip ${form.lang === l ? 'active' : ''}`}
              onClick={() => set('lang', form.lang === l ? '' : l)}
            >{l}</button>
          ))}
        </div>
      </div>

      {formError && <p className="ariza-error">{formError}</p>}
      <button type="submit" className="ariza-submit">
        {f.continueBtn}
      </button>
    </form>
    </>
  )
}
