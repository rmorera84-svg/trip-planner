import React, { useState } from 'react'
import { fuelAustria } from '../live.js'
import { fmtTime } from '../time.js'
import Icon from '../icons.jsx'

const LINKS = {
  DE: { label: 'Precios en Alemania (Tankerkönig)', url: 'https://www.tankerkoenig.de/' },
  CZ: { label: 'Precios en Chequia (Pumpa.cz)', url: 'https://www.pumpa.cz/' }
}

// Gasolineras más baratas cerca (Austria en vivo; otros países con enlace)
export default function FuelCard({ loc, fuelType = 'SUP' }) {
  const [state, setState] = useState(null)
  if (!loc || loc.lat == null) return null

  const search = async () => {
    setState({ loading: true })
    try { setState(await fuelAustria(loc.lat, loc.lng, fuelType)) } catch (e) { setState({ error: e.message }) }
  }
  const nearby = `https://www.google.com/maps/search/gas+station/@${loc.lat},${loc.lng},13z`

  return (
    <div className="card fuel">
      <h3><Icon name="fuel" size={18} /> Gasolina cerca</h3>
      {loc.country === 'AT' ? (
        <>
          {!state && <button className="btn block" onClick={search}>Buscar la más barata ({fuelType === 'DIE' ? 'diésel' : 'Super 95'})</button>}
          {state && state.loading && <div className="skeleton line" />}
          {state && state.error && <p className="error small">No se pudo consultar ({state.error}). <a href={nearby} target="_blank" rel="noreferrer">Ver en Maps</a></p>}
          {state && state.stations && (
            <>
              <ol className="fuel-list">
                {state.stations.map(s => (
                  <li key={s.id}>
                    <div>
                      <b>{s.name}</b> <span className="fuel-price">€{s.price.toFixed(3)}</span>
                      <div className="muted tiny">{s.address}, {s.city} · {s.distance.toFixed(1)} km{s.pay ? ' · ' + s.pay : ''}</div>
                    </div>
                    <a className="icon-btn" href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" aria-label="Cómo llegar"><Icon name="nav" size={18} /></a>
                  </li>
                ))}
              </ol>
              <div className="muted tiny">Actualizado {fmtTime(new Date(state.t).toISOString(), 'Europe/Vienna')} · Fuente: E-Control · En Austria solo suben a las 12:00 (lun, mié, vie)</div>
            </>
          )}
        </>
      ) : (
        <div className="btns">
          {LINKS[loc.country] && <a className="btn" href={LINKS[loc.country].url} target="_blank" rel="noreferrer">{LINKS[loc.country].label}</a>}
          <a className="btn" href={nearby} target="_blank" rel="noreferrer">Gasolineras en Maps</a>
        </div>
      )}
    </div>
  )
}
