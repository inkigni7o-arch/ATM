import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './AdminPage.css'
import './WidgetsPage.css'

const SESSION_KEY = 'atm_admin_auth'

export default function WidgetsPage() {
  const navigate = useNavigate()
  const authed = localStorage.getItem(SESSION_KEY) === '1'
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!authed) { navigate('/admin'); return }
    load()
  }, [])

  const load = () => {
    fetch(`${API}/api/widgets`)
      .then(r => r.json())
      .then(setImages)
      .catch(() => {})
  }

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      await fetch(`${API}/api/widgets`, { method: 'POST', body: fd })
    }
    setUploading(false)
    load()
    e.target.value = ''
  }

  const remove = async (filename) => {
    await fetch(`${API}/api/widgets/${encodeURIComponent(filename)}`, { method: 'DELETE' })
    load()
  }

  if (!authed) return null

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="back-btn" onClick={() => navigate('/admin')}>← Orqaga</button>
          <span className="admin-logo-text">Vidjet rasmlari</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-table-wrap">
          <div className="admin-table-header">
            <h3>Karusel rasmlari ({images.length})</h3>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="refresh-btn" onClick={load}>↻ Yangilash</button>
              <button className="admin-nav-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
                {uploading ? 'Yuklanmoqda...' : '+ Rasm qo\'shish'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleUpload} />
            </div>
          </div>

          {images.length === 0 ? (
            <div className="admin-empty">Hozircha rasmlar yo'q</div>
          ) : (
            <div className="widget-grid">
              {images.map((img, i) => (
                <div className="widget-card" key={i}>
                  <img src={`${API}${img.url}`} alt="" className="widget-thumb" />
                  <button className="widget-delete" onClick={() => remove(img.filename)}>🗑</button>
                  <div className="widget-order">#{i + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
