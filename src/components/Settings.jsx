import React, { useState } from 'react'
import ImportScreen from './ImportScreen.jsx'
import { downloadJson, deletedEvents, setDeleted } from '../trip.js'
import { fmtShortDate } from '../time.js'
import { clearCache } from '../db.js'
import Icon from '../icons.jsx'

export default function Settings({ trip, onImport, onClear, update, back, fuelType, setFuelType }) {
  const [msg, setMsg] = useState(null)
  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)
  const removed = deletedEvents(trip)

  return (
    <>
      <div className="topbar"><button className="icon-btn" onClick={back} aria-label="Volver"><Icon name="left" /></button></div>
      <header className="page-head"><div className="eyebrow">Trip Planner v0.2</div><h1>Ajustes</h1></header>

      <div className="card">
        <div className="kv"><span>Viaje</span><b>{trip.trip.name}</b></div>
        <div className="kv"><span>Versión JSON</span><b>{trip.schema_version || '—'}</b></div>
        <div className="kv"><span>Instalada</span><b>{isStandalone ? 'Sí' : 'No (abierta en el navegador)'}</b></div>
      </div>

      <h3>Combustible del carro</h3>
      <div className="seg">
        {[['SUP', 'Gasolina (Super 95)'], ['DIE', 'Diésel']].map(([k, l]) => (
          <button key={k} className={fuelType === k ? 'on' : ''} onClick={() => setFuelType(k)}>{l}</button>
        ))}
      </div>

      <h3>Respaldo</h3>
      <button className="btn block" onClick={() => downloadJson(trip)}><Icon name="download" size={18} /> Exportar JSON (con tus cambios)</button>

      <h3>Reemplazar itinerario</h3>
      <p className="muted small">Importar un JSON nuevo reemplaza el actual en este teléfono. Exporta primero si hiciste cambios.</p>
      <ImportScreen onImport={onImport} compact />

      {removed.length > 0 && <>
        <h3>Eventos eliminados</h3>
        {removed.map(e => (
          <div key={e.id} className="card row">
            <span className="small"><b>{e.title}</b><br /><span className="muted">{fmtShortDate(e._date)}</span></span>
            <button className="btn sm" onClick={() => update(t => setDeleted(t, e.id, false))}><Icon name="undo" size={16} /> Restaurar</button>
          </div>
        ))}
      </>}

      <h3>Datos en vivo</h3>
      <button className="btn block" onClick={async () => { await clearCache(); setMsg('Caché borrada: el clima y las tarifas se volverán a descargar.') }}>
        <Icon name="refresh" size={18} /> Borrar datos guardados (clima, tarifas)
      </button>
      {msg && <p className="ok small">{msg}</p>}
      <p className="muted tiny">Fuentes: Open-Meteo (clima), TfL (metro de Londres), E-Control (gasolina en Austria), OpenStreetMap (mapas).</p>

      <h3>Instalar en el teléfono</h3>
      <div className="card small">
        <p><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i>.</p>
        <p className="no-margin"><b>iPhone (Safari):</b> Compartir → <i>Agregar a pantalla de inicio</i>. Debe ser Safari.</p>
      </div>

      <button className="btn danger block" onClick={() => { if (confirm('¿Borrar el itinerario de este teléfono?')) onClear() }}>
        <Icon name="trash" size={18} /> Borrar datos de este teléfono
      </button>
    </>
  )
}
