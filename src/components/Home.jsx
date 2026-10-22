import React from 'react'
import { fmtTime, fmtShortDate, fmtDay, countdownText, cityOf, todayInTrip, durationText } from '../time.js'
import { currentAndNext, visibleEvents, lodgingTonight, mapsDir, dayCountry, checklistFor } from '../trip.js'
import { typeInfo, countryInfo } from '../theme.js'
import { useNow, useWeather } from '../hooks.js'
import { WeatherChip } from './Weather.jsx'
import Icon from '../icons.jsx'

function Hero({ e, label, now, wx, go }) {
  const t = typeInfo(e.type)
  const ms = Date.parse(e.start_utc) - now.getTime()
  return (
    <div className="hero-card" style={{ '--type': t.color }}>
      <div className="hero-top">
        <span className="hero-label">{label}</span>
        <span className="hero-when">{label === 'Ahora' ? 'en curso' : countdownText(ms)}</span>
      </div>
      <button className="hero-main" onClick={() => go({ screen: 'event', id: e.id })}>
        <span className="type-badge"><Icon name={t.icon} size={22} /></span>
        <span>
          <span className="hero-title">{e.title}</span>
          <span className="hero-sub">
            {fmtTime(e.start_utc, e.timezone)}
            {e.end_utc && ' – ' + fmtTime(e.end_utc, e.end_timezone || e.timezone)} · {cityOf(e.timezone)}
          </span>
          {e.location && <span className="hero-place"><Icon name="pin" size={14} /> {e.location.name}</span>}
        </span>
      </button>
      <div className="hero-actions">
        <WeatherChip wx={wx} />
        <a className="btn primary sm" href={mapsDir(e.location)} target="_blank" rel="noreferrer"><Icon name="nav" size={16} /> Cómo llegar</a>
      </div>
    </div>
  )
}

export default function Home({ trip, go }) {
  const now = useNow()
  const { current, next } = currentAndNext(trip, now)
  const today = todayInTrip(trip.days, now)
  const dayIdx = trip.days.findIndex(d => d.date === today)
  const start = trip.days[0], first = visibleEvents(start)[0]
  const before = !today && first && Date.parse(first.start_utc) > now.getTime()
  const focusDay = trip.days.find(d => d.date === today) || (next && trip.days.find(d => d.date === next._date)) || start
  const strip = visibleEvents(focusDay)
  const heroEvents = [current, next].filter(Boolean)
  const wx = useWeather(heroEvents)
  const hotel = lodgingTonight(trip, focusDay.date)
  const country = countryInfo(dayCountry(focusDay))
  const nowIso = now.toISOString()
  const due = (trip.reminders || []).filter(r => !r.done && r.trigger_utc <= nowIso)
  const preList = checklistFor(trip, first && first.id)[0]
  const preDone = preList ? preList.items.filter(i => i.done).length : 0

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">{country.flag} {before ? 'Próximo viaje' : today ? `Día ${dayIdx + 1} de ${trip.days.length}` : 'Viaje'}</div>
        <h1>{trip.trip.name}</h1>
        <div className="muted">{fmtShortDate(trip.trip.start_date)} – {fmtShortDate(trip.trip.end_date)} · {trip.days.length} días</div>
        {today && <div className="progress trip"><div style={{ width: ((dayIdx + 1) / trip.days.length) * 100 + '%' }} /></div>}
      </header>

      {before && (
        <div className="countdown">
          <div className="big">{Math.max(0, Math.ceil((Date.parse(first.start_utc) - now.getTime()) / 864e5))}</div>
          <div>días para salir<div className="muted small">{fmtDay(start.date)}</div></div>
        </div>
      )}

      {current && <Hero e={current} label="Ahora" now={now} wx={wx[current.id]} go={go} />}
      {next && <Hero e={next} label={current ? 'Después' : 'Próximo'} now={now} wx={wx[next.id]} go={go} />}
      {!current && !next && <div className="card center-text">🎉 ¡Viaje completado!</div>}

      {due.length > 0 && (
        <button className="card alert" onClick={() => go({ screen: 'reminders' })}>
          <Icon name="bell" size={18} /> <b>{due.length} aviso{due.length > 1 ? 's' : ''} pendiente{due.length > 1 ? 's' : ''}</b>
          <div className="small">{due[0].title}</div>
        </button>
      )}

      {before && preList && (
        <button className="card" onClick={() => go({ screen: 'event', id: first.id })}>
          <div className="row"><b><Icon name="check" size={18} /> {preList.title}</b><span className="muted">{preDone}/{preList.items.length}</span></div>
          <div className="progress"><div style={{ width: (preDone / preList.items.length) * 100 + '%' }} /></div>
        </button>
      )}

      <div className="section-head">
        <h2>{today ? 'Hoy' : fmtDay(focusDay.date)}</h2>
        <button className="link" onClick={() => go({ screen: 'days', date: focusDay.date })}>Ver día <Icon name="right" size={16} /></button>
      </div>
      <div className="strip">
        {strip.map(e => {
          const t = typeInfo(e.type)
          const past = e.start_utc && (e.end_utc || e.start_utc) < nowIso
          return (
            <button key={e.id} className={'strip-card' + (past ? ' past' : '')} style={{ '--type': t.color }}
              onClick={() => go({ screen: 'event', id: e.id })}>
              <span className="strip-time">{fmtTime(e.start_utc, e.timezone)}</span>
              <span className="type-dot"><Icon name={t.icon} size={16} /></span>
              <span className="strip-title">{e.title}</span>
            </button>
          )
        })}
      </div>

      {hotel && (
        <div className="card hotel-card">
          <div className="row">
            <div>
              <div className="eyebrow">Hotel esta noche</div>
              <b>{hotel.name}</b>
              <div className="muted small">{hotel.address}</div>
            </div>
            <span className={'pill ' + (hotel.paid ? 'green' : 'red')}>{hotel.paid ? 'Pagado' : 'Pendiente'}</span>
          </div>
          <div className="btns">
            <a className="btn sm" href={mapsDir(hotel)} target="_blank" rel="noreferrer"><Icon name="nav" size={16} /> Cómo llegar</a>
          </div>
        </div>
      )}

      {next && current && (
        <p className="muted tiny center-text">Siguiente actividad {countdownText(Date.parse(next.start_utc) - now.getTime())} · {durationText((Date.parse(next.start_utc) - now.getTime()) / 60000)}</p>
      )}
    </>
  )
}
