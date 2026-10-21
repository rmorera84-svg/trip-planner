import React from 'react'
import { fmtDateTime, fmtTime, cityOf } from '../time.js'
import { findEvent, TYPE_ICON, travelerNames, checklistFor, lodgingById, costText } from '../trip.js'
import ChecklistCard from './ChecklistCard.jsx'

export default function EventDetail({ trip, id, back, update }) {
  const found = findEvent(trip, id)
  if (!found) return <p>Evento no encontrado.</p>
  const { event: e } = found
  const loc = e.location
  const lodging = e.lodging_id && lodgingById(trip, e.lodging_id)
  const lists = checklistFor(trip, e.id)
  const cost = costText(e.cost)
  const links = e.live && e.live.flight && e.live.flight.web_links

  return (
    <>
      <div className="topbar"><button className="link" onClick={back}>‹ Volver</button></div>
      <h1>{TYPE_ICON[e.type] || '•'} {e.title}</h1>

      <div className="card">
        <div className="kv"><span>Inicio</span><b>{fmtDateTime(e.start_utc, e.timezone)}</b></div>
        {e.end_utc && <div className="kv"><span>Fin</span><b>{fmtDateTime(e.end_utc, e.end_timezone || e.timezone)}</b></div>}
        <div className="kv"><span>Hora local</span><b>{cityOf(e.timezone)}{e.end_timezone && e.end_timezone !== e.timezone ? ' → ' + cityOf(e.end_timezone) : ''}</b></div>
        {e.travelers && <div className="kv"><span>Quiénes</span><b>{travelerNames(trip, e.travelers)}</b></div>}
        {cost && <div className="kv"><span>Costo</span><b>{cost}</b></div>}
        {e.booking && e.booking.required && (
          <div className="kv"><span>Reserva</span>
            <b className={e.booking.confirmed ? 'ok' : 'bad'}>{e.booking.confirmed ? 'Confirmada' : 'Pendiente de compra'}
              {e.booking.confirmation_code ? ' · ' + e.booking.confirmation_code : ''}</b>
          </div>
        )}
      </div>

      {e.flight && (
        <div className="card">
          <h3>✈️ {e.flight.number || e.flight.airline}</h3>
          <div className="kv"><span>Ruta</span><b>{e.flight.dep_iata}{e.flight.dep_terminal ? ' T' + e.flight.dep_terminal : ''} → {e.flight.arr_iata}{e.flight.arr_terminal ? ' T' + e.flight.arr_terminal : ''}</b></div>
          <div className="kv"><span>Salida</span><b>{fmtTime(e.start_utc, e.timezone)} ({cityOf(e.timezone)})</b></div>
          {e.end_utc && <div className="kv"><span>Llegada</span><b>{fmtTime(e.end_utc, e.end_timezone || e.timezone)} ({cityOf(e.end_timezone || e.timezone)})</b></div>}
          <p className="muted small">Estado en vivo: disponible en la semana 2.</p>
          <div className="btns">
            {links && links.flightradar24 && <a className="btn" href={links.flightradar24} target="_blank" rel="noreferrer">Flightradar24</a>}
            {links && links.flightaware && <a className="btn" href={links.flightaware} target="_blank" rel="noreferrer">FlightAware</a>}
          </div>
        </div>
      )}

      {loc && (
        <div className="card">
          <h3>📍 {loc.name}</h3>
          {lodging && <p className="muted small">{lodging.address}</p>}
          <div className="btns">
            <a className="btn primary" href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer">Cómo llegar</a>
            <a className="btn" href={loc.maps_url} target="_blank" rel="noreferrer">Ver en mapa</a>
          </div>
          {loc.coords_source === 'manual_approx' && <p className="muted small">Ubicación aproximada.</p>}
        </div>
      )}

      {e.description && <div className="card"><p>{e.description}</p>
        {e.details && e.details.length > 0 && <ul>{e.details.map((d, i) => <li key={i}>{d}</li>)}</ul>}
      </div>}

      {e.tips && e.tips.length > 0 && (
        <div className="card tips">
          <h3>💡 Tips</h3>
          <ul>{e.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}

      {lists.map(c => <ChecklistCard key={c.id} list={c} update={update} />)}

      {e.booking && e.booking.url && (
        <a className="btn block" href={e.booking.url} target="_blank" rel="noreferrer">🔗 Sitio de la reserva</a>
      )}
    </>
  )
}
