import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './AdminPage.css'
import './UniversitiesPage.css'

const SESSION_KEY = 'atm_admin_auth'

export default function ContractsPage() {
  const navigate = useNavigate()
  const authed = localStorage.getItem(SESSION_KEY) === '1'
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(null)
  const fileRefs = useRef({})

  useEffect(() => {
    if (!authed) { navigate('/admin'); return }
    load()
  }, [])

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/contracts`)
      .then(r => r.json())
      .then(d => { setUniversities(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const uploadPdf = async (id, file) => {
    if (!file) return
    setUploading(id)
    const fd = new FormData()
    fd.append('pdf', file)
    await fetch(`${API}/api/contracts/${id}/pdf`, { method: 'POST', body: fd })
    setUploading(null)
    load()
  }

  const removePdf = async (id) => {
    await fetch(`${API}/api/contracts/${id}/pdf`, { method: 'DELETE' })
    load()
  }

  const filtered = universities.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!authed) return null

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="back-btn" onClick={() => navigate('/admin')}>← Orqaga</button>
          <span className="admin-logo-text">Shartnomalar</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Universitetlar ({filtered.length})</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                className="contract-search"
                placeholder="🔍 Universitet nomi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="refresh-btn" onClick={load}>↻ Yangilash</button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">Topilmadi</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nomi</th>
                  <th>Mamlakat</th>
                  <th>Shahar</th>
                  <th>Shartnoma (PDF)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.country || '—'}</td>
                    <td>{u.city || '—'}</td>
                    <td>
                      <div className="contract-pdf-cell">
                        {u.contract_pdf ? (
                          <>
                            <a
                              href={`${API}${u.contract_pdf}`}
                              target="_blank"
                              rel="noreferrer"
                              className="pdf-link"
                            >
                              📄 Ko'rish
                            </a>
                            <button className="btn-delete" onClick={() => removePdf(u.id)} title="O'chirish">🗑</button>
                          </>
                        ) : (
                          <button
                            className="pdf-upload-btn"
                            onClick={() => fileRefs.current[u.id]?.click()}
                            disabled={uploading === u.id}
                          >
                            {uploading === u.id ? '⏳ Yuklanmoqda...' : '📎 PDF biriktirish'}
                          </button>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          ref={el => fileRefs.current[u.id] = el}
                          onChange={e => uploadPdf(u.id, e.target.files[0])}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
