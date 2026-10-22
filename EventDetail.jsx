import React, { useEffect, useState } from 'react'
import { fmtDateTime, fmtTime, cityOf } from '../time.js'
import { findEvent, travelerNames, checklistFor, lodgingById, costText, mapsDir, setDeleted } from '../trip.js'
import { typeInfo, countryInfo } from '../theme.js'
import { tflLeg, tflFare, isPeak } from '../live.js'
import { useWeather } from '../hooks.js'
import { WeatherCard } from './Weather.jsx'
import FuelCard from './FuelCard.jsx'
import ChecklistCard from './ChecklistCard.jsx'
import Icon from '../icons.jsx'

function TflFare({ e }) {
  const leg = tflLeg(e)
  const [f, setF] = useState(null)
  useEffect(() => {
    if (!leg) return
    let alive = true
    tflFare(leg.from, leg.to).then(r => alive && setF(r)).catch(() => alive && setF({ error: true }))
    return () => { alive = false }
  }, [leg && leg.from, leg && leg.to])
  if (!leg) return null
  const peak = isPeak(e.start_utc)
  return (
    <div className="card">
      <h3><Icon name="ticket" size={18} /> Tarifa (contactless)</h3>
      {!f && <div className="skeleton line" />}
      {f && f.error && <p className="muted small">Sin conexión con TfL.</p>}
      {f && !f.error && (
        <div className="fare-split">
          <div className={peak ? 'on' : ''}><span>Pico</span><b>£{f.peak != null ? f.peak.toFixed(2) : '—'}</b></div>
          <div className={!peak ? 'on' : ''}><span>Valle</span><b>£{f.offPeak != null ? f.offPeak.toFixed(2) : '—'}</b></div>
        </div>
      )}
      <div className="muted tiny">A esta hora aplica tarifa {peak ? 'pico' : 'valle'} · líneas: {(leg.lines || []).join(', ')}</div>
    </div>
  )
}

export default function EventDetail({ trip, id, back, update, openEditor, fuelType }) {
  const found = findEvent(trip, id)
  const e = found && found.event
  const wx = useWeather(e ? [e] : [])
  if (!found) return <p className="muted">Evento no encontrado.</p>
  const t = typeInfo(e.type)
  const loc = e.location
  const country = countryInfo(loc && loc.country)
  const lodging = e.lodging_id && lodgingById(trip, e.lodging_id)
  const lists = checklistFor(trip, e.id)
  const cost = costText(e.cost)
  const links = e.live && e.live.flight && e.live.flight.web_links
  const showFuel = (e.live && e.live.driving) || /gasolina|fuel|tanque/i.test(e.title)

  const remove = () => {
    if (!confirm('¿Eliminar este evento? Podrás restaurarlo desde Ajustes.')) return
    update(tr => setDeleted(tr, e.id, true))
    back()
  }

  return (
    <>
      <div className="detail-hero" style={{ '--type': t.color }}>
        <div className="topbar">
          <button className="icon-btn glass" onClick={back} aria-label="Volver"><Icon name="left" /></button>
          <button className="icon-btn glass" onClick={() => openEditor({ date: found.day.date, event: e })} aria-label="Editar"><Icon name="edit" /></button>
        </div>
        <span className="type-badge lg"><Icon name={t.icon} size={28} /></span>
        <div className="eyebrow light">{t.label} · {country.flag} {cityOf(e.timezone)}</div>
        <h1>{e.title}</h1>
        <div className="detail-time">
          {fmtDateTime(e.start_utc, e.timezone)}
          {e.end_utc && ' → ' + fmtTime(e.end_utc, e.end_timezone || e.timezone)}
          {e.end_timezone && e.end_timezone !== e.timezone && ` (${cityOf(e.end_timezone)})`}
        </div>
      </div>

      <div className="action-row">
        <a className="btn primary" href={mapsDir(loc)} target="_blank" rel="noreferrer"><Icon name="nav" size={18} /> Cómo llegar</a>
        {loc && loc.maps_url && <a className="btn" href={loc.maps_url} target="_blank" rel="noreferrer"><Icon name="map" size={18} /> Mapa</a>}
        {e.booking && e.booking.url && <a className="btn" href={e.booking.url} target="_blank" rel="noreferrer"><Icon name="external" size={18} /> Reserva</a>}
      </div>

      <WeatherCard wx={wx[e.id]} loading={!(e.id in wx) && !!(loc && loc.lat != null)} />

      {e.flight && (
        <div className="card flight">
          <div className="flight-route">
            <div><b>{e.flight.dep_iata}</b><span>{fmtTime(e.start_utc, e.timezone)}</span><small>{e.flight.dep_terminal ? 'T' + e.flight.dep_terminal : ''}</small></div>
            <div className="flight-line"><Icon name="plane" size={20} /></div>
            <div><b>{e.flight.arr_iata}</b><span>{fmtTime(e.end_utc, e.end_timezone || e.timezone)}</span><small>{e.flight.arr_terminal ? 'T' + e.flight.arr_terminal : ''}</small></div>
          </div>
          <div className="muted small center-text">{e.flight.airline} {e.flight.number}</div>
          <div className="btns">
            {links && links.flightradar24 && <a className="btn sm" href={links.flightradar24} target="_blank" rel="noreferrer">Flightradar24</a>}
            {links && links.flightaware && <a className="btn sm" href={links.flightaware} target="_blank" rel="noreferrer">FlightAware</a>}
          </div>
        </div>
      )}

      <TflFare e={e} />
      {showFuel && <FuelCard loc={loc} fuelType={fuelType} />}

      <div className="card">
        {loc && <div className="kv"><span>Lugar</span><b>{loc.name}</b></div>}
        {lodging && <div className="kv"><span>Dirección</span><b>{lodging.address}</b></div>}
        {e.travelers && <div className="kv"><span>Quiénes</span><b>{travelerNames(trip, e.travelers)}</b></div>}
        {cost && <div className="kv"><span>Costo</span><b>{cost}</b></div>}
        {e.booking && e.booking.required && (
          <div className="kv"><span>Reserva</span>
            <b className={e.booking.confirmed ? 'ok' : 'bad'}>{e.booking.confirmed ? 'Confirmada' : 'Pendiente de compra'}
              {e.booking.confirmation_code ? ' · ' + e.booking.confirmation_code : ''}</b>
          </div>
        )}
        {loc && loc.coords_source === 'manual_approx' && <div className="muted tiny">Ubicación aproximada</div>}
      </div>

      {(e.description || (e.details && e.details.length > 0)) && (
        <div className="card">
          {e.description && <p className="no-margin">{e.description}</p>}
          {e.details && e.details.length > 0 && <ul>{e.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
        </div>
      )}

      {e.tips && e.tips.length > 0 && (
        <div className="card tips">
          <h3>💡 Tips</h3>
          <ul>{e.tips.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      )}

      {lists.map(c => <ChecklistCard key={c.id} list={c} update={update} />)}

      <button className="btn danger block" onClick={remove}><Icon name="trash" size={18} /> Eliminar evento</button>
    </>
  )
}
