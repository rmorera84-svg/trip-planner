import React from 'react'
import { fmtDateTime, cityOf } from '../time.js'
import { stamp } from '../trip.js'

export default function Reminders({ trip, update, go }) {
  const now = new Date().toISOString()
  const list = [...(trip.reminders || [])].sort((a, b) => a.trigger_utc.localeCompare(b.trigger_utc))
  const toggle = id => update(t => { const r = t.reminders.find(x => x.id === id); r.done = !r.done; stamp(r) })

  return (
    <>
      <h1>Avisos</h1>
      <p className="muted small">Las notificaciones automáticas llegan en la semana 2. Por ahora, revisa esta lista.</p>
      {list.map(r => {
        const due = !r.done && r.trigger_utc <= now
        return (
          <div key={r.id} className={'card reminder ' + (r.done ? 'done' : due ? 'due' : '')}>
            <label className="check">
              <input type="checkbox" checked={!!r.done} onChange={() => toggle(r.id)} />
              <span><b>{r.title}</b>{r.optional && <span className="pill gray">Opcional</span>}</span>
            </label>
            <div className="muted small">{fmtDateTime(r.trigger_utc, r.timezone)} · {cityOf(r.timezone)}</div>
            <p className="small">{r.message}</p>
            <div className="btns">
              {r.url && <a className="btn" href={r.url} target="_blank" rel="noreferrer">Abrir sitio</a>}
              {r.event_id && <button className="btn" onClick={() => go({ screen: 'event', id: r.event_id })}>Ver evento</button>}
            </div>
          </div>
        )
      })}
    </>
  )
}
