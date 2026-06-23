import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import API from '../config'
import './ApplyForm.css'

const INITIAL = { name: '', phone: '', email: '', university: '', message: '' }

export default function ApplyForm() {
  const { t } = useLanguage()
  const f = t.form
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || f.errRequired)
      setStatus('success')
      setForm(INITIAL)
    } catch (err) {
      setStatus('error')
      setErrMsg(err.message)
    }
  }

  return (
    <section className="apply-section" id="apply">
      <div className="container apply-inner">
        <div className="apply-text">
          <h2 className="section-title" style={{ textAlign: 'left', whiteSpace: 'pre-line' }}>
            {f.title}
          </h2>
          <p>{f.desc}</p>
          <ul className="apply-perks">
            {f.perks.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div className="apply-form-wrap">
          {status === 'success' ? (
            <div className="success-msg">
              <div className="success-icon">🎉</div>
              <h3>{f.successTitle}</h3>
              <p>{f.successDesc}</p>
              <button className="btn btn-primary" onClick={() => setStatus(null)}>
                {f.successBtn}
              </button>
            </div>
          ) : (
            <form className="apply-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{f.name}</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder={f.namePh} required />
                </div>
                <div className="form-group">
                  <label>{f.phone}</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder={f.phonePh} required />
                </div>
              </div>
              <div className="form-group">
                <label>{f.email}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder={f.emailPh} required />
              </div>
              <div className="form-group">
                <label>{f.university}</label>
                <input name="university" value={form.university} onChange={handleChange} placeholder={f.universityPh} />
              </div>
              <div className="form-group">
                <label>{f.message}</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder={f.messagePh} />
              </div>
              {status === 'error' && <p className="form-error">⚠ {errMsg}</p>}
              <button type="submit" className="btn btn-primary submit-btn" disabled={status === 'loading'}>
                {status === 'loading' ? f.submitting : f.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
