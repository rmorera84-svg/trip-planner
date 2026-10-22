import React from 'react'
import { fmtDateTime, cityOf } from '../time.js'
import { stamp } from '../trip.js'
import Icon from '../icons.jsx'

export default function Reminders({ trip, update, go, back }) {
  const now = new Date().toISOString()
  const list = [...(trip.reminders || [])].sort((a, b) => a.trigger_utc.localeCompare(b.trigger_utc))
  const toggle = id => update(t => { const r = t.reminders.find(x => x.id === id); r.done = !r.done; stamp(r) })
  const pending = list.filter(r => !r.done).length

  return (
    <>
      <div className="topbar"><button className="icon-btn" onClick={back} aria-label="Volver"><Icon name="left" /></button></div>
      <header className="page-head"><div className="eyebrow">{pending} pendientes</div><h1>Avisos</h1></header>
      {list.map(r => {
        const due = !r.done && r.trigger_utc <= now
        return (
          <div key={r.id} className={'card reminder ' + (r.done ? 'done' : due ? 'due' : '')}>
            <label className="check">
              <input type="checkbox" checked={!!r.done} onChange={() => toggle(r.id)} />
              <span><b>{r.title}</b>{r.optional && <span className="pill gray">Opcional</span>}</span>
            </label>
            <div className="muted small"><Icon name="clock" size={14} /> {fmtDateTime(r.trigger_utc, r.timezone)} · {cityOf(r.timezone)}</div>
            <p className="small">{r.message}</p>
            <div className="btns">
              {r.url && <a className="btn sm" href={r.url} target="_blank" rel="noreferrer"><Icon name="external" size={16} /> Abrir sitio</a>}
              {r.event_id && <button className="btn sm" onClick={() => go({ screen: 'event', id: r.event_id })}>Ver evento</button>}
            </div>
          </div>
        )
      })}
    </>
  )
}
