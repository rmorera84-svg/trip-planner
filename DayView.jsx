import React, { useState } from 'react'
import { fmtDay, fmtTime, cityOf, durationText, todayInTrip } from '../time.js'
import { visibleEvents, travelerNames, dayCountry, eventState } from '../trip.js'
import { typeInfo, countryInfo } from '../theme.js'
import { tflLeg } from '../live.js'
import { useNow, useWeather } from '../hooks.js'
import { WeatherChip } from './Weather.jsx'
import DayChips from './DayChips.jsx'
import FareCard from './FareCard.jsx'
import Icon from '../icons.jsx'

export default function DayView({ trip, date, go, replace, openEditor }) {
  const now = useNow()
  const [refresh, setRefresh] = useState(0)
  const today = todayInTrip(trip.days, now)
  const day = trip.days.find(d => d.date === date) || trip.days.find(d => d.date === today) || trip.days[0]
  const evs = visibleEvents(day)
  const wx = useWeather(evs, refresh)
  const country = countryInfo(dayCountry(day))
  const nowIso = now.toISOString()
  const hasTfl = evs.some(e => tflLeg(e))
  let lastTz = null

  return (
    <>
      <DayChips days={trip.days} active={day.date} today={today} onPick={d => replace({ screen: 'days', date: d })} />
      <header className="page-head">
        <div className="eyebrow">{country.flag} {country.name}</div>
        <h1 className="cap">{fmtDay(day.date)}</h1>
        <div className="muted">{day.area}{day.travelers ? ' · ' + travelerNames(trip, day.travelers) : ''}</div>
        <div className="head-actions">
          <button className="btn sm" onClick={() => go({ screen: 'map', date: day.date })}><Icon name="map" size={16} /> Mapa</button>
          <button className="btn sm" onClick={() => setRefresh(r => r + 1)}><Icon name="refresh" size={16} /> Actualizar</button>
        </div>
      </header>

      {(day.warnings || []).map((w, i) => <div key={i} className="card warn"><Icon name="alert" size={18} /> {w}</div>)}
      {hasTfl && <FareCard events={evs} compact />}

      <ol className="timeline">
        {evs.map((e, i) => {
          const t = typeInfo(e.type)
          const nextE = evs[i + 1]
          const state = eventState(e, nextE, nowIso)
          const tzChange = e.timezone && lastTz && e.timezone !== lastTz
          lastTz = e.timezone || lastTz
          const endIso = e.end_utc || e.start_utc
          const gap = nextE && nextE.start_utc && endIso ? (Date.parse(nextE.start_utc) - Date.parse(endIso)) / 60000 : 0
          return (
            <li key={e.id} className={'tl-item ' + state + (e.status === 'alternative' ? ' alt' : '')} style={{ '--type': t.color }}>
              {tzChange && <div className="tz-change"><Icon name="clock" size={14} /> Ahora en hora de {cityOf(e.timezone)}</div>}
              <div className="tl-row">
                <div className="tl-time">
                  <b>{fmtTime(e.start_utc, e.timezone)}</b>
                  {e.end_utc && <span>{fmtTime(e.end_utc, e.end_timezone || e.timezone)}</span>}
                </div>
                <div className="tl-rail"><span className="tl-dot"><Icon name={t.icon} size={14} stroke={2.4} /></span></div>
                <button className="tl-card" onClick={() => go({ screen: 'event', id: e.id })}>
                  <div className="tl-title">{e.title}</div>
                  {e.location && <div className="muted small ellipsis">{e.location.name}</div>}
                  <div className="badges">
                    <WeatherChip wx={wx[e.id]} loading={!(e.id in wx) && !!(e.location && e.location.lat != null)} />
                    {state === 'now' && <span className="pill accent">Ahora</span>}
                    {e.status === 'alternative' && <span className="pill gray">Alternativa</span>}
                    {e.booking && e.booking.required && !e.booking.confirmed && <span className="pill red">Por comprar</span>}
                    {e.flight && <span className="pill indigo">{e.flight.number || e.flight.airline}</span>}
                    {e.source === 'user' && <span className="pill gray">Agregado</span>}
                  </div>
                </button>
              </div>
              {gap >= 10 && <div className="tl-gap">{durationText(gap)} libre</div>}
            </li>
          )
        })}
      </ol>
      {evs.length === 0 && <p className="muted center-text">Sin eventos este día.</p>}

      <button className="fab" style={{ '--accent': country.color }} onClick={() => openEditor({ date: day.date })} aria-label="Agregar evento">
        <Icon name="plus" size={26} stroke={2.5} />
      </button>
    </>
  )
}
