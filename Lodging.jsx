import React from 'react'
import { fmtShortDate } from '../time.js'
import { travelerNames, mapsDir } from '../trip.js'
import { countryInfo } from '../theme.js'
import Icon from '../icons.jsx'

export default function Lodging({ trip, back }) {
  const list = trip.lodging || []
  return (
    <>
      <div className="topbar"><button className="icon-btn" onClick={back} aria-label="Volver"><Icon name="left" /></button></div>
      <header className="page-head"><div className="eyebrow">{list.length} alojamientos</div><h1>Hoteles</h1></header>
      {list.map(h => (
        <div key={h.id} className="card hotel-card" style={{ '--accent': countryInfo(h.country).color }}>
          <div className="row">
            <div>
              <div className="eyebrow">{countryInfo(h.country).flag} {fmtShortDate(h.check_in)} → {fmtShortDate(h.check_out)} · {h.nights} noche{h.nights > 1 ? 's' : ''}</div>
              <h3 className="no-margin">{h.name}</h3>
            </div>
            <span className={'pill ' + (h.paid ? 'green' : 'red')}>{h.paid ? 'Pagado' : 'Pendiente'}</span>
          </div>
          <p className="small muted">{h.address}</p>
          {h.notes && <p className="small">💡 {h.notes}</p>}
          {h.travelers && <p className="muted tiny">{travelerNames(trip, h.travelers)}</p>}
          <div className="btns">
            <a className="btn primary sm" href={mapsDir(h)} target="_blank" rel="noreferrer"><Icon name="nav" size={16} /> Cómo llegar</a>
            {h.maps_url && <a className="btn sm" href={h.maps_url} target="_blank" rel="noreferrer"><Icon name="map" size={16} /> Mapa</a>}
          </div>
        </div>
      ))}
    </>
  )
}
