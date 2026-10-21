import React from 'react'
import { fmtDay, fmtShortDate, fmtDateTime, cityOf, todayInTrip } from '../time.js'
import { visibleEvents, nextEvent, TYPE_ICON } from '../trip.js'

export default function TripHome({ trip, go }) {
  const today = todayInTrip(trip.days)
  const next = nextEvent(trip)
  const pendingReminders = (trip.reminders || []).filter(r => !r.done && r.trigger_utc <= new Date().toISOString())

  return (
    <>
      <header className="hero">
        <h1>{trip.trip.name}</h1>
        <p>{fmtShortDate(trip.trip.start_date)} – {fmtShortDate(trip.trip.end_date)} · {trip.days.length} días</p>
      </header>

      {pendingReminders.length > 0 && (
        <button className="card alert" onClick={() => go({ screen: 'reminders' })}>
          🔔 {pendingReminders.length} aviso(s) pendiente(s) — {pendingReminders[0].title}
        </button>
      )}

      {next && (
        <button className="card next" onClick={() => go({ screen: 'event', id: next.id })}>
          <div className="label">Próximo</div>
          <div className="title">{TYPE_ICON[next.type] || '•'} {next.title}</div>
          <div className="muted">{fmtDateTime(next.start_utc, next.timezone)} · {cityOf(next.timezone)}</div>
        </button>
      )}

      <h2>Días</h2>
      <div className="list">
        {trip.days.map(d => {
          const evs = visibleEvents(d)
          return (
            <button key={d.date} className={'card day' + (d.date === today ? ' today' : '')}
              onClick={() => go({ screen: 'day', date: d.date })}>
              <div className="row">
                <div>
                  <div className="cap">{fmtDay(d.date)}{d.date === today && <span className="pill">Hoy</span>}</div>
                  <div className="title">{d.area}</div>
                  <div className="muted small">{d.summary}</div>
                </div>
                <div className="count">{evs.length}</div>
              </div>
              {d.warnings && d.warnings.map((w, i) => <div key={i} className="warn small">⚠️ {w}</div>)}
            </button>
          )
        })}
      </div>
    </>
  )
}
