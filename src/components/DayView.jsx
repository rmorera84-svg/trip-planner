import React from 'react'
import { fmtDay, fmtTime, cityOf } from '../time.js'
import { visibleEvents, TYPE_ICON, travelerNames } from '../trip.js'

export default function DayView({ trip, date, go, back }) {
  const idx = trip.days.findIndex(d => d.date === date)
  const day = trip.days[idx]
  if (!day) return <p>Día no encontrado.</p>
  const evs = visibleEvents(day)
  const prev = trip.days[idx - 1], next = trip.days[idx + 1]
  let lastTz = null

  return (
    <>
      <div className="topbar">
        <button className="link" onClick={back}>‹ Volver</button>
        <div className="nav-days">
          <button className="link" disabled={!prev} onClick={() => go({ screen: 'day', date: prev.date })}>◀</button>
          <button className="link" disabled={!next} onClick={() => go({ screen: 'day', date: next.date })}>▶</button>
        </div>
      </div>
      <h1 className="cap">{fmtDay(day.date)}</h1>
      <p className="muted">{day.area} · {travelerNames(trip, day.travelers)}</p>
      {day.warnings && day.warnings.map((w, i) => <div key={i} className="card warn">⚠️ {w}</div>)}

      <ol className="timeline">
        {evs.map(e => {
          const tzChange = e.timezone && e.timezone !== lastTz && lastTz !== null
          lastTz = e.timezone || lastTz
          return (
            <li key={e.id}>
              {tzChange && <div className="tz-change">🕐 Hora local: {cityOf(e.timezone)}</div>}
              <button className={'event ' + (e.status === 'alternative' ? 'alt' : '')} onClick={() => go({ screen: 'event', id: e.id })}>
                <div className="time">
                  {fmtTime(e.start_utc, e.timezone)}
                  {e.end_utc && <span className="end">{fmtTime(e.end_utc, e.end_timezone || e.timezone)}</span>}
                </div>
                <div className="body">
                  <div className="title">{TYPE_ICON[e.type] || '•'} {e.title}</div>
                  {e.location && <div className="muted small">{e.location.name}</div>}
                  <div className="badges">
                    {e.status === 'alternative' && <span className="pill gray">Alternativa</span>}
                    {e.booking && e.booking.required && !e.booking.confirmed && <span className="pill red">Por comprar</span>}
                    {e.booking && e.booking.confirmed && <span className="pill green">Confirmado</span>}
                    {e.flight && <span className="pill blue">{e.flight.number || e.flight.airline}</span>}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </>
  )
}
