import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import MapPicker from '../components/MapPicker'
import './AdminPage.css'
import './SozlamalarPage.css'

const SESSION_KEY = 'atm_admin_auth'
const EMPTY_TEST = { test_date: '', test_time: '', test_address: '' }

export default function SozlamalarPage() {
  const navigate = useNavigate()
  const authed = localStorage.getItem(SESSION_KEY) === '1'

  const [tests, setTests] = useState([])
  const [newTest, setNewTest] = useState(EMPTY_TEST)
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const [prices, setPrices] = useState({ price_support: 415000, price_contract: 18500000 })
  const [savingPrices, setSavingPrices] = useState(false)
  const [savedPrices, setSavedPrices] = useState(false)

  useEffect(() => {
    if (!authed) { navigate('/admin'); return }
    fetch(`${API}/api/tests`).then(r => r.json()).then(setTests).catch(() => {})
    fetch(`${API}/api/settings`).then(r => r.json()).then(d => setPrices({ price_support: d.price_support, price_contract: d.price_contract })).catch(() => {})
  }, [])

  const addTest = async e => {
    e.preventDefault()
    if (!newTest.test_date || !newTest.test_time || !newTest.test_address) return
    setAdding(true)
    const r = await fetch(`${API}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTest),
    }).then(r => r.json())
    setTests(prev => [...prev, { id: r.id, ...newTest }])
    setNewTest(EMPTY_TEST)
    setShowAdd(false)
    setAdding(false)
  }

  const deleteTest = id => {
    fetch(`${API}/api/tests/${id}`, { method: 'DELETE' })
    setTests(prev => prev.filter(t => t.id !== id))
  }

  const savePrices = async e => {
    e.preventDefault()
    setSavingPrices(true)
    await fetch(`${API}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prices),
    })
    setSavingPrices(false)
    setSavedPrices(true)
    setTimeout(() => setSavedPrices(false), 2500)
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="admin-back-btn" onClick={() => navigate('/admin')}>← Orqaga</button>
          <span className="admin-logo-text">📋 Ariza tafsilotlari</span>
        </div>
      </div>

      <div className="soz-two-col">

        {/* LEFT — Tests */}
        <div className="soz-col">
          <div className="soz-col-header">
            <h3>Test ma'lumotlari</h3>
            <button className="soz-add-btn" onClick={() => setShowAdd(v => !v)}>
              {showAdd ? '✕ Bekor' : "+ Qo'shish"}
            </button>
          </div>

          {showAdd && (
            <form className="soz-add-form" onSubmit={addTest}>
              <div className="soz-field">
                <label>Sana</label>
                <input type="date" value={newTest.test_date} onChange={e => setNewTest(p => ({ ...p, test_date: e.target.value }))} required />
              </div>
              <div className="soz-field">
                <label>Vaqt</label>
                <input type="time" value={newTest.test_time} onChange={e => setNewTest(p => ({ ...p, test_time: e.target.value }))} required />
              </div>
              <div className="soz-field">
                <label>Manzil</label>
                <MapPicker
                  value={newTest.test_address}
                  onChange={v => setNewTest(p => ({ ...p, test_address: v }))}
                />
              </div>
              <button type="submit" className="soz-save-btn" disabled={adding}>{adding ? "Qo'shilmoqda..." : "Qo'shish"}</button>
            </form>
          )}

          <div className="soz-tests-list">
            {tests.length === 0 ? (
              <div className="soz-empty">Rejalashtirilgan testlar yo'q</div>
            ) : tests.map(t => (
              <div className="soz-test-card" key={t.id}>
                <div className="soz-test-info">
                  <div className="soz-test-date">📅 {new Date(t.test_date).toLocaleDateString('uz-UZ')} &nbsp; 🕐 {t.test_time}</div>
                  <div className="soz-test-addr">📍 {t.test_address}</div>
                </div>
                <button className="btn-delete" onClick={() => deleteTest(t.id)}>🗑</button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Prices */}
        <div className="soz-col">
          <div className="soz-col-header">
            <h3>To'lov summalari</h3>
          </div>
          <form className="soz-prices-form" onSubmit={savePrices}>
            <div className="soz-field">
              <label>Konsalting yordami bilan (so'm)</label>
              <input
                type="number"
                value={prices.price_support}
                onChange={e => setPrices(p => ({ ...p, price_support: Number(e.target.value) }))}
                min={0}
              />
            </div>
            <div className="soz-field">
              <label>Shartnoma asosida (so'm)</label>
              <input
                type="number"
                value={prices.price_contract}
                onChange={e => setPrices(p => ({ ...p, price_contract: Number(e.target.value) }))}
                min={0}
              />
            </div>
            <div className="soz-actions">
              {savedPrices && <span className="soz-saved">✓ Saqlandi</span>}
              <button type="submit" className="soz-save-btn" disabled={savingPrices}>
                {savingPrices ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
