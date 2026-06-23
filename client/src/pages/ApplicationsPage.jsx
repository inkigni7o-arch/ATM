import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './AdminPage.css'
import './ApplicationsPage.css'

const SESSION_KEY = 'atm_admin_auth'

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const authed = localStorage.getItem(SESSION_KEY) === '1'

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!authed) { navigate('/admin'); return }
    fetch(`${API}/api/applications`)
      .then(r => r.json())
      .then(data => { setApplications(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    return (
      a.name?.toLowerCase().includes(q) ||
      a.last_name?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.passport?.toLowerCase().includes(q)
    )
  })

  const del = (id) => {
    fetch(`${API}/api/applications/${id}`, { method: 'DELETE' })
      .then(() => {
        setApplications(prev => prev.filter(x => x.id !== id))
        if (selected?.id === id) setSelected(null)
      })
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="admin-back-btn" onClick={() => navigate('/admin')}>← Orqaga</button>
          <span className="admin-logo-text">📋 Ariza tafsilotlari</span>
        </div>
        <div className="admin-header-right">
          <button className="refresh-btn" onClick={() => {
            setLoading(true)
            fetch(`${API}/api/applications`)
              .then(r => r.json())
              .then(data => { setApplications(data); setLoading(false) })
          }}>↻ Yangilash</button>
        </div>
      </div>

      <div className="app-page-content">
        <div className="app-list-panel">
          <input
            className="app-search"
            placeholder="Ism, telefon yoki pasport bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {loading ? (
            <div className="admin-loading">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">Hech narsa topilmadi</div>
          ) : (
            <div className="app-list">
              {filtered.map((a, i) => (
                <div
                  key={a.id}
                  className={`app-list-item ${selected?.id === a.id ? 'active' : ''}`}
                  onClick={() => setSelected(a)}
                >
                  <div className="app-list-num">{i + 1}</div>
                  <div className="app-list-info">
                    <div className="app-list-name">{a.name} {a.last_name || ''}</div>
                    <div className="app-list-phone">{a.phone}</div>
                  </div>
                  <div className="app-list-date">{new Date(a.createdAt).toLocaleDateString('uz-UZ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-detail-panel">
          {!selected ? (
            <div className="app-detail-empty">Ariza tanlang</div>
          ) : (
            <>
              <div className="app-detail-header">
                <h3>{selected.name} {selected.last_name || ''}</h3>
                <button className="btn-delete" onClick={() => del(selected.id)}>🗑 O'chirish</button>
              </div>
              <div className="app-detail-grid">
                <div className="app-detail-section">
                  <div className="app-detail-section-title">Shaxsiy ma'lumotlar</div>
                  <div className="app-detail-row"><span>Ism</span><span>{selected.name}</span></div>
                  <div className="app-detail-row"><span>Familiya</span><span>{selected.last_name || '—'}</span></div>
                  <div className="app-detail-row"><span>Telefon</span><span>{selected.phone}</span></div>
                  <div className="app-detail-row"><span>Pasport</span><span>{selected.passport || '—'}</span></div>
                  <div className="app-detail-row"><span>JSHSHR</span><span>{selected.jshshr || '—'}</span></div>
                </div>

                <div className="app-detail-section">
                  <div className="app-detail-section-title">Manzil</div>
                  <div className="app-detail-row"><span>Viloyat</span><span>{selected.viloyat || '—'}</span></div>
                  <div className="app-detail-row"><span>Shahar / Tuman</span><span>{selected.shahar || '—'}</span></div>
                  <div className="app-detail-row"><span>Mahalla</span><span>{selected.street || '—'}</span></div>
                  <div className="app-detail-row"><span>Ko'cha</span><span>{selected.street2 || '—'}</span></div>
                </div>

                <div className="app-detail-section">
                  <div className="app-detail-section-title">Ta'lim</div>
                  <div className="app-detail-row"><span>Maktab</span><span>{selected.school || '—'}</span></div>
                  <div className="app-detail-row"><span>Sinf</span><span>{selected.grade || '—'}</span></div>
                  <div className="app-detail-row"><span>Mutaxassislik</span><span>{selected.direction || '—'}</span></div>
                  <div className="app-detail-row"><span>Suhbat tili</span><span>{selected.lang || '—'}</span></div>
                </div>

                <div className="app-detail-section">
                  <div className="app-detail-section-title">Universitetlar</div>
                  <div className="app-detail-row"><span>1-tanlov</span><span>{selected.uni1 || '—'}</span></div>
                  <div className="app-detail-row"><span>2-tanlov</span><span>{selected.uni2 || '—'}</span></div>
                  <div className="app-detail-row"><span>3-tanlov</span><span>{selected.uni3 || '—'}</span></div>
                </div>

                <div className="app-detail-section">
                  <div className="app-detail-section-title">Boshqa</div>
                  <div className="app-detail-row"><span>Yuborilgan sana</span><span>{new Date(selected.createdAt).toLocaleString('uz-UZ')}</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
