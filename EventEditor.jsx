import React, { useState } from 'react'
import Sheet from './Sheet.jsx'
import { localParts, zonedToUtc, fmtShortDate } from '../time.js'
import { upsertEvent, stamp, newId, dayTz } from '../trip.js'
import { TYPE } from '../theme.js'
import Icon from '../icons.jsx'

// Agregar o editar un evento (hora local del lugar → se guarda en UTC)
export default function EventEditor({ trip, date, event, onClose, update }) {
  const isNew = !event
  const day = trip.days.find(d => d.date === date) || trip.days[0]
  const tzs = [...new Set(trip.days.flatMap(d => d.events.map(e => e.timezone)).filter(Boolean))]
  const tz0 = (event && event.timezone) || dayTz(day)
  const start = event && event.start_utc ? localParts(event.start_utc, tz0) : null
  const end = event && event.end_utc ? localParts(event.end_utc, event.end_timezone || tz0) : null

  const [f, setF] = useState({
    title: (event && event.title) || '',
    type: (event && event.type) || 'sight',
    date: day.date,
    start: start ? start.time : '12:00',
    end: end ? end.time : '',
    timezone: tz0,
    place: (event && event.location && event.location.name) || '',
    lat: event && event.location ? event.location.lat : null,
    lng: event && event.location ? event.location.lng : null,
    country: (event && event.location && event.location.country) || null,
    description: (event && event.description) || '',
    tips: ((event && event.tips) || []).join('\n'),
    alternative: !!(event && event.status === 'alternative')
  })
  const [err, setErr] = useState(null)
  const [locating, setLocating] = useState(false)
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))

  const useMyLocation = () => {
    if (!navigator.geolocation) return setErr('Este teléfono no permite ubicación.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      p => { setF(s => ({ ...s, lat: Math.round(p.coords.latitude * 1e5) / 1e5, lng: Math.round(p.coords.longitude * 1e5) / 1e5 })); setLocating(false) },
      () => { setErr('No se pudo obtener la ubicación.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const save = () => {
    if (!f.title.trim()) return setErr('Ponle un título.')
    if (!/^\d{2}:\d{2}$/.test(f.start)) return setErr('Hora de inicio inválida.')
    const startUtc = zonedToUtc(f.date, f.start, f.timezone)
    let endUtc = null
    if (f.end) {
      endUtc = zonedToUtc(f.date, f.end, f.timezone)
      if (endUtc <= startUtc) endUtc = new Date(Date.parse(endUtc) + 864e5).toISOString().replace('.000Z', 'Z')
    }
    const placeChanged = !event || !event.location || event.location.name !== f.place
    const hasCoords = f.lat != null && f.lng != null
    const location = f.place || hasCoords ? {
      ...((event && event.location) || {}),
      name: f.place || 'Ubicación',
      lat: hasCoords ? f.lat : null,
      lng: hasCoords ? f.lng : null,
      country: f.country,
      coords_source: hasCoords && (placeChanged || !event.location.coords_source) ? 'user' : ((event && event.location && event.location.coords_source) || 'user'),
      maps_url: hasCoords ? `https://www.google.com/maps/search/?api=1&query=${f.lat},${f.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.place)}`
    } : null
    const base = event ? structuredClone(event) : {
      id: newId(), details: [], cost: null, live: { last_updated_utc: null, data: null },
      booking: { required: null, confirmed: null, confirmation_code: null, url: null },
      created_at: new Date().toISOString(), deleted: false, source: 'user', version: 0,
      travelers: day.travelers || null
    }
    Object.assign(base, {
      title: f.title.trim(), type: f.type, timezone: f.timezone, start_utc: startUtc, end_utc: endUtc,
      description: f.description.trim(), tips: f.tips.split('\n').map(x => x.trim()).filter(Boolean),
      status: f.alternative ? 'alternative' : 'planned', location
    })
    if (location && location.lat != null) base.live = { ...(base.live || {}), weather: { provider: 'open-meteo' } }
    stamp(base)
    update(tr => upsertEvent(tr, f.date, base))
    onClose()
  }

  return (
    <Sheet title={isNew ? 'Nuevo evento' : 'Editar evento'} onClose={onClose}>
      <label className="field"><span>Título</span>
        <input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Ej. Café en Montmartre" autoFocus={isNew} />
      </label>
      <div className="type-picker">
        {Object.entries(TYPE).map(([k, v]) => (
          <button key={k} type="button" className={'type-opt' + (f.type === k ? ' on' : '')} style={{ '--type': v.color }} onClick={() => set('type', k)}>
            <Icon name={v.icon} size={18} /><span>{v.label}</span>
          </button>
        ))}
      </div>
      <div className="grid2">
        <label className="field"><span>Día</span>
          <select value={f.date} onChange={e => set('date', e.target.value)}>
            {trip.days.map(d => <option key={d.date} value={d.date}>{fmtShortDate(d.date)} · {d.area}</option>)}
          </select>
        </label>
        <label className="field"><span>Zona horaria</span>
          <select value={f.timezone} onChange={e => set('timezone', e.target.value)}>
            {tzs.map(z => <option key={z} value={z}>{z.split('/').pop().replace(/_/g, ' ')}</option>)}
          </select>
        </label>
        <label className="field"><span>Inicio (hora local)</span>
          <input type="time" value={f.start} onChange={e => set('start', e.target.value)} />
        </label>
        <label className="field"><span>Fin (opcional)</span>
          <input type="time" value={f.end} onChange={e => set('end', e.target.value)} />
        </label>
      </div>
      <label className="field"><span>Lugar</span>
        <input value={f.place} onChange={e => set('place', e.target.value)} placeholder="Nombre o dirección" />
      </label>
      <div className="row small">
        <span className="muted">{f.lat != null ? `📍 ${f.lat}, ${f.lng}` : 'Sin coordenadas (sin clima ni mapa)'}</span>
        <button type="button" className="link" onClick={useMyLocation} disabled={locating}>
          <Icon name="locate" size={16} /> {locating ? 'Buscando…' : 'Usar mi ubicación'}
        </button>
      </div>
      <label className="field"><span>Descripción</span>
        <textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} />
      </label>
      <label className="field"><span>Tips (uno por línea)</span>
        <textarea rows={3} value={f.tips} onChange={e => set('tips', e.target.value)} />
      </label>
      <label className="check"><input type="checkbox" checked={f.alternative} onChange={e => set('alternative', e.target.checked)} /><span>Es un plan alternativo</span></label>
      {err && <p className="error small">{err}</p>}
      <button className="btn primary block" onClick={save}>{isNew ? 'Agregar' : 'Guardar cambios'}</button>
    </Sheet>
  )
}
