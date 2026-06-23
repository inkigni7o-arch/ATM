import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../config'
import './ProgramsPage.css'

export default function ProgramsPage() {
  const navigate = useNavigate()
  const [universities, setUniversities] = useState([])
  const [degrees, setDegrees] = useState([])
  const [directions, setDirections] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ requirements: [], degrees: [], directions: [], contract_fee: '', grant: false })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('uni')
  const [newDegree, setNewDegree] = useState('')
  const [newDirection, setNewDirection] = useState('')
  const [uniSearch, setUniSearch] = useState('')

  useEffect(() => {
    fetch(`${API}/api/universities`).then(r => r.json()).then(setUniversities).catch(() => {})
    fetch(`${API}/api/degree-types`).then(r => r.json()).then(setDegrees).catch(() => {})
    fetch(`${API}/api/directions`).then(r => r.json()).then(setDirections).catch(() => {})
  }, [])

  const [newReq, setNewReq] = useState('')

  const selectUni = (u) => {
    setSelected(u)
    setForm({
      requirements: u.requirements ? JSON.parse(u.requirements) : [],
      degrees: u.degrees ? JSON.parse(u.degrees) : [],
      directions: u.directions ? JSON.parse(u.directions) : [],
      contract_fee: u.contract_fee || '',
      grant: u.grant === '1',
    })
  }

  const addReq = () => {
    if (!newReq.trim()) return
    setForm(p => ({ ...p, requirements: [...p.requirements, newReq.trim()] }))
    setNewReq('')
  }

  const removeReq = (i) => setForm(p => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }))

  const toggleDegree = (name) => {
    setForm(p => ({
      ...p,
      degrees: p.degrees.includes(name) ? p.degrees.filter(d => d !== name) : [...p.degrees, name]
    }))
  }

  const toggleDirection = (name) => {
    setForm(p => ({
      ...p,
      directions: p.directions.includes(name) ? p.directions.filter(d => d !== name) : [...p.directions, name]
    }))
  }

  const save = async () => {
    setSaving(true)
    await fetch(`${API}/api/universities/${selected.id}/programs`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, grant: form.grant })
    })
    setUniversities(prev => prev.map(u => u.id === selected.id
      ? { ...u, requirements: form.requirements, degrees: JSON.stringify(form.degrees), directions: JSON.stringify(form.directions) }
      : u
    ))
    setSaving(false)
  }

  const addDegree = async () => {
    if (!newDegree.trim()) return
    const res = await fetch(`${API}/api/degree-types`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newDegree.trim() })
    })
    const data = await res.json()
    if (data.id) { setDegrees(p => [...p, { id: data.id, name: newDegree.trim() }]); setNewDegree('') }
  }

  const delDegree = async (id) => {
    await fetch(`${API}/api/degree-types/${id}`, { method: 'DELETE' })
    setDegrees(p => p.filter(d => d.id !== id))
  }

  const addDirection = async () => {
    if (!newDirection.trim()) return
    const res = await fetch(`${API}/api/directions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newDirection.trim() })
    })
    const data = await res.json()
    if (data.id) { setDirections(p => [...p, { id: data.id, name: newDirection.trim() }]); setNewDirection('') }
  }

  const delDirection = async (id) => {
    await fetch(`${API}/api/directions/${id}`, { method: 'DELETE' })
    setDirections(p => p.filter(d => d.id !== id))
  }

  return (
    <div className="prg-page">
      <div className="prg-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>← Orqaga</button>
        <h2>O'quv dasturlari</h2>
      </div>

      <div className="prg-tabs">
        <button className={`prg-tab ${tab === 'uni' ? 'active' : ''}`} onClick={() => setTab('uni')}>Universitetlar</button>
        <button className={`prg-tab ${tab === 'degrees' ? 'active' : ''}`} onClick={() => setTab('degrees')}>Darajalar</button>
        <button className={`prg-tab ${tab === 'directions' ? 'active' : ''}`} onClick={() => setTab('directions')}>Yo'nalishlar</button>
      </div>

      {tab === 'degrees' && (
        <div className="prg-tag-section">
          <div className="prg-tag-add">
            <input value={newDegree} onChange={e => setNewDegree(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDegree()} placeholder="Yangi daraja..." />
            <button onClick={addDegree} disabled={!newDegree.trim()}>+</button>
          </div>
          <div className="prg-tags">
            {degrees.map(d => (
              <div key={d.id} className="prg-tag">
                <span>{d.name}</span>
                <button onClick={() => delDegree(d.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'directions' && (
        <div className="prg-tag-section">
          <div className="prg-tag-add">
            <input value={newDirection} onChange={e => setNewDirection(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDirection()} placeholder="Yangi yo'nalish..." />
            <button onClick={addDirection} disabled={!newDirection.trim()}>+</button>
          </div>
          <div className="prg-tags">
            {directions.map(d => (
              <div key={d.id} className="prg-tag">
                <span>{d.name}</span>
                <button onClick={() => delDirection(d.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'uni' && (
        <div className="prg-layout">
          <div className="prg-uni-list">
            <div className="prg-uni-search">
              <input
                placeholder="Qidirish..."
                value={uniSearch}
                onChange={e => setUniSearch(e.target.value)}
              />
            </div>
            {universities.filter(u => u.name.toLowerCase().includes(uniSearch.toLowerCase())).map(u => (
              <div
                key={u.id}
                className={`prg-uni-item ${selected?.id === u.id ? 'active' : ''}`}
                onClick={() => selectUni(u)}
              >
                <span className="prg-uni-item-name">{u.name}</span>
                <span className="prg-uni-item-sub">{[u.country, u.city].filter(Boolean).join(', ')}</span>
              </div>
            ))}
          </div>

          <div className="prg-edit-panel">
            {!selected ? (
              <p className="prg-empty">Universitetni tanlang</p>
            ) : (
              <>
                <h3 className="prg-edit-title">{selected.name}</h3>

                <div className="prg-edit-section">
                  <label>Talablar</label>
                  <div className="prg-req-add">
                    <input
                      value={newReq}
                      onChange={e => setNewReq(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addReq()}
                      placeholder="IELTS 5.5, SAT 1200..."
                    />
                    <button onClick={addReq} disabled={!newReq.trim()}>+</button>
                  </div>
                  <div className="prg-tags">
                    {form.requirements.map((r, i) => (
                      <div key={i} className="prg-tag">
                        <span>{r}</span>
                        <button onClick={() => removeReq(i)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="prg-edit-section">
                  <label>Ta'lim darajalari</label>
                  <div className="prg-checkboxes">
                    {degrees.map(d => (
                      <label key={d.id} className="prg-checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.degrees.includes(d.name)}
                          onChange={() => toggleDegree(d.name)}
                        />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="prg-edit-section">
                  <label>Yo'nalishlar</label>
                  {!form.directions.includes('*') && (
                    <>
                      <div className="prg-req-add">
                        <input
                          value={newDirection}
                          onChange={e => setNewDirection(e.target.value)}
                          onKeyDown={async e => { if (e.key === 'Enter') { await addDirection(); } }}
                          placeholder="Yangi yo'nalish..."
                        />
                        <button onClick={addDirection} disabled={!newDirection.trim()}>+</button>
                      </div>
                      <div className="prg-checkboxes" style={{ marginTop: 8, marginBottom: 10 }}>
                        {directions.map(d => (
                          <div key={d.id} className="prg-checkbox-item">
                            <input
                              type="checkbox"
                              checked={form.directions.includes(d.name)}
                              onChange={() => toggleDirection(d.name)}
                            />
                            <span>{d.name}</span>
                            <button
                              className="prg-checkbox-del"
                              onClick={() => delDirection(d.id)}
                              title="O'chirish"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label className="prg-toggle">
                      <input
                        type="checkbox"
                        checked={form.directions.includes('*')}
                        onChange={() => setForm(p => ({
                          ...p,
                          directions: p.directions.includes('*') ? [] : ['*']
                        }))}
                      />
                      <span className="prg-toggle-track"><span className="prg-toggle-thumb" /></span>
                      <span className="prg-toggle-label">Barcha yo'nalishlar</span>
                    </label>
                  </div>
                </div>

                <div className="prg-edit-section">
                  <label>Kontrakt to'lovi</label>
                  {!form.grant && (
                    <input
                      className="prg-text-input"
                      value={form.contract_fee}
                      onChange={e => setForm(p => ({ ...p, contract_fee: e.target.value }))}
                      placeholder="Masalan: $5,000 / yil"
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: form.grant ? 0 : 8 }}>
                    <label className="prg-toggle">
                      <input
                        type="checkbox"
                        checked={form.grant}
                        onChange={() => setForm(p => ({ ...p, grant: !p.grant }))}
                      />
                      <span className="prg-toggle-track"><span className="prg-toggle-thumb" /></span>
                      <span className="prg-toggle-label">Grant</span>
                    </label>
                  </div>
                </div>

                <button className="prg-save-btn" onClick={save} disabled={saving}>
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
