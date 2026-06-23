import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './AdminPage.css'
import './UniversitiesPage.css'

const SESSION_KEY = 'atm_admin_auth'

const EMPTY = { name: '', country: '', city: '', continent: '', admission_start: '', admission_end: '' }

export default function UniversitiesPage() {
  const navigate = useNavigate()
  const authed = localStorage.getItem(SESSION_KEY) === '1'

  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!authed) { navigate('/admin'); return }
    load()
  }, [])

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/universities`)
      .then(r => r.json())
      .then(d => { setUniversities(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const openAdd = () => {
    setForm(EMPTY); setEditId(null)
    setImageFile(null); setImagePreview(null)
    setShowForm(true)
  }

  const openEdit = (u) => {
    setForm({
      name: u.name, country: u.country || '', city: u.city || '',
      continent: u.continent || '',
      admission_start: u.admission_start || '',
      admission_end: u.admission_end || '',
    })
    setEditId(u.id)
    setImageFile(null)
    setImagePreview(u.image_url ? `${API}${u.image_url}` : null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false); setEditId(null); setForm(EMPTY)
    setImageFile(null); setImagePreview(null)
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    if (editId) {
      await fetch(`${API}/api/universities/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (imageFile) {
        setUploadingImg(true)
        const fd = new FormData()
        fd.append('image', imageFile)
        await fetch(`${API}/api/universities/${editId}/image`, { method: 'POST', body: fd })
        setUploadingImg(false)
      }
    } else {
      const r = await fetch(`${API}/api/universities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const { id } = await r.json()
      if (imageFile && id) {
        setUploadingImg(true)
        const fd = new FormData()
        fd.append('image', imageFile)
        await fetch(`${API}/api/universities/${id}/image`, { method: 'POST', body: fd })
        setUploadingImg(false)
      }
    }

    setSaving(false)
    closeForm()
    load()
  }

  const nextYear = async () => {
    await fetch(`${API}/api/universities/next-year`, { method: 'POST' })
    load()
  }

  const remove = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return
    await fetch(`${API}/api/universities/${id}`, { method: 'DELETE' })
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
          <span className="admin-logo-text">Universitetlar</span>
        </div>
      </div>

      <div className="admin-content">
        {showForm && (
          <div className="uni-form-overlay" onClick={closeForm}>
            <form className="uni-form" onSubmit={save} onClick={e => e.stopPropagation()}>
              <h3>{editId ? 'Tahrirlash' : 'Yangi universitet'}</h3>

              <label>Nomi *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Universitet nomi" required />

              <label>Kontinent</label>
              <select value={form.continent} onChange={e => setForm(p => ({ ...p, continent: e.target.value }))}>
                <option value="">— Tanlang —</option>
                <option value="Osiyo">Osiyo</option>
                <option value="Yevropa">Yevropa</option>
                <option value="Amerika">Amerika</option>
                <option value="Avstraliya">Avstraliya</option>
              </select>

              <label>Mamlakat</label>
              <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Mamlakat" />

              <label>Shahar</label>
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Shahar" />

              <div className="uni-dates">
                <div>
                  <label>Qabul boshlanishi</label>
                  <input type="date" value={form.admission_start} onChange={e => setForm(p => ({ ...p, admission_start: e.target.value }))} />
                </div>
                <div>
                  <label>Qabul tugashi</label>
                  <input type="date" value={form.admission_end} onChange={e => setForm(p => ({ ...p, admission_end: e.target.value }))} />
                </div>
              </div>

              <label>Rasm (1100×870)</label>
              <div className="uni-image-upload" onClick={() => fileRef.current.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="uni-image-preview" />
                  : <span className="uni-image-placeholder">🖼 Rasmni tanlash uchun bosing</span>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImage} />

              <div className="uni-form-actions">
                <button type="button" onClick={closeForm}>Bekor</button>
                <button type="submit" className="btn-primary" disabled={saving || uploadingImg}>
                  {uploadingImg ? 'Rasm yuklanmoqda...' : saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Universitetlar ro'yxati ({filtered.length})</h3>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <input
                className="contract-search"
                placeholder="🔍 Universitet nomi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="next-year-btn" onClick={nextYear}>📅 +1 yil</button>
              <button className="refresh-btn" onClick={load}>↻ Yangilash</button>
              <button className="admin-nav-btn" onClick={openAdd}>+ Qo'shish</button>
            </div>
          </div>
          {loading ? (
            <div className="admin-loading">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">{universities.length === 0 ? "Hozircha universitetlar yo'q" : 'Topilmadi'}</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rasm</th>
                  <th>Nomi</th>
                  <th>Kontinent</th>
                  <th>Mamlakat</th>
                  <th>Shahar</th>
                  <th>Qabul boshlanishi</th>
                  <th>Qabul tugashi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td className="uni-img-cell">
                      {u.image_url
                        ? <img src={`${API}${u.image_url}`} alt="" className="uni-thumb" />
                        : <span className="uni-no-img">—</span>}
                    </td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.continent || '—'}</td>
                    <td>{u.country || '—'}</td>
                    <td>{u.city || '—'}</td>
                    <td>{u.admission_start || '—'}</td>
                    <td>{u.admission_end || '—'}</td>
                    <td className="uni-actions">
                      <button className="btn-edit" onClick={() => openEdit(u)}>✏️</button>
                      <button className="btn-delete" onClick={() => remove(u.id)}>🗑</button>
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
