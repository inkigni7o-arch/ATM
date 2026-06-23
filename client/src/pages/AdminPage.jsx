import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './AdminPage.css'

const SESSION_KEY = 'atm_admin_auth'

export default function AdminPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => localStorage.getItem(SESSION_KEY) === '1')
  const [input, setInput] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)

  const login = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: input.login, password: input.password }),
      })
      if (res.ok) {
        localStorage.setItem(SESSION_KEY, '1')
        setAuthed(true)
      } else {
        setError('Login yoki parol noto\'g\'ri')
      }
    } catch {
      setError('Server bilan bog\'lanishda xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setInput({ login: '', password: '' })
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    fetch(`${API}/api/applications`)
      .then(r => r.json())
      .then(data => { setApplications(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authed])

  if (!authed) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="admin-logo">🔐</div>
          <h2>Admin Panel</h2>
          <p>AbiturentTestMarkazi</p>
          <form onSubmit={login}>
            <input
              type="text"
              placeholder="Login"
              value={input.login}
              onChange={e => { setInput(p => ({ ...p, login: e.target.value })); setError(false) }}
              className={error ? 'error' : ''}
              autoFocus
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Parol"
              value={input.password}
              onChange={e => { setInput(p => ({ ...p, password: e.target.value })); setError(false) }}
              className={error ? 'error' : ''}
              autoComplete="current-password"
            />
            {error && <span className="admin-error">{error}</span>}
            <button type="submit" disabled={submitting}>{submitting ? 'Tekshirilmoqda...' : 'Kirish'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo-text">🎓 AbiturentTestMarkazi</span>
          <span className="admin-badge">Admin Panel</span>
        </div>
        <div className="admin-header-right">
          <button className="admin-logout" onClick={logout}>Chiqish</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-nav-cards">
          <div className="admin-nav-card" onClick={() => navigate('/admin/universities')}>
            <span className="admin-nav-card-icon">🏫</span>
            <span className="admin-nav-card-label">Universitetlar</span>
          </div>
          <div className="admin-nav-card" onClick={() => navigate('/admin/programs')}>
            <span className="admin-nav-card-icon">📚</span>
            <span className="admin-nav-card-label">O'quv dasturlari</span>
          </div>
          <div className="admin-nav-card" onClick={() => navigate('/admin/contracts')}>
            <span className="admin-nav-card-icon">📄</span>
            <span className="admin-nav-card-label">Shartnomalar</span>
          </div>
          <div className="admin-nav-card" onClick={() => navigate('/admin/widgets')}>
            <span className="admin-nav-card-icon">🖼</span>
            <span className="admin-nav-card-label">Vidjet rasmlari</span>
          </div>
          <div className="admin-nav-card" onClick={() => navigate('/admin/settings')}>
            <span className="admin-nav-card-icon">📋</span>
            <span className="admin-nav-card-label">Ariza tafsilotlari</span>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Arizalar ro'yxati</h3>
            <button className="refresh-btn" onClick={() => {
              setLoading(true)
              fetch(`${API}/api/applications`)
                .then(r => r.json())
                .then(data => { setApplications(data); setLoading(false) })
            }}>↻ Yangilash</button>
          </div>

          {loading ? (
            <div className="admin-loading">Yuklanmoqda...</div>
          ) : applications.length === 0 ? (
            <div className="admin-empty">Hozircha arizalar yo'q</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ism Familiya</th>
                  <th>Telefon</th>
                  <th>Pasport</th>
                  <th>JSHSHR</th>
                  <th>Sinf</th>
                  <th>1-uni</th>
                  <th>2-uni</th>
                  <th>3-uni</th>
                  <th>Sana</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a, i) => (
                  <tr key={a.id}>
                    <td>{i + 1}</td>
                    <td>{a.name} {a.last_name || ''}</td>
                    <td>{a.phone}</td>
                    <td>{a.passport || '—'}</td>
                    <td>{a.jshshr || '—'}</td>
                    <td>{a.grade || '—'}</td>
                    <td>{a.uni1 || '—'}</td>
                    <td>{a.uni2 || '—'}</td>
                    <td>{a.uni3 || '—'}</td>
                    <td>{new Date(a.createdAt).toLocaleString('uz-UZ')}</td>
                    <td>
                      <button className="btn-delete" onClick={() => {
                        fetch(`${API}/api/applications/${a.id}`, { method: 'DELETE' })
                          .then(() => setApplications(prev => prev.filter(x => x.id !== a.id)))
                      }}>🗑</button>
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
