import React from 'react'
import { fmtShortDate } from '../time.js'
import { travelerNames } from '../trip.js'

export default function Lodging({ trip }) {
  const list = trip.lodging || []
  return (
    <>
      <h1>Hoteles</h1>
      {list.map(h => (
        <div key={h.id} className="card">
          <div className="row">
            <h3>🏨 {h.name}</h3>
            <span className={'pill ' + (h.paid ? 'green' : 'red')}>{h.paid ? 'Pagado' : 'Pendiente'}</span>
          </div>
          <div className="muted small">{fmtShortDate(h.check_in)} → {fmtShortDate(h.check_out)} · {h.nights} noche(s)</div>
          <p className="small">{h.address}</p>
          {h.notes && <p className="small tips">💡 {h.notes}</p>}
          {h.travelers && <p className="muted small">{travelerNames(trip, h.travelers)}</p>}
          <div className="btns">
            <a className="btn primary" href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noreferrer">Cómo llegar</a>
            <a className="btn" href={h.maps_url} target="_blank" rel="noreferrer">Mapa</a>
          </div>
        </div>
      ))}
    </>
  )
}
