import React from 'react'
import ImportScreen from './ImportScreen.jsx'
import { downloadJson } from '../trip.js'

export default function Settings({ trip, onImport, onClear }) {
  const isStandalone = typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)

  return (
    <>
      <h1>Ajustes</h1>
      <div className="card">
        <div className="kv"><span>Viaje</span><b>{trip.trip.name}</b></div>
        <div className="kv"><span>Versión JSON</span><b>{trip.schema_version || '—'}</b></div>
        <div className="kv"><span>Instalada</span><b>{isStandalone ? 'Sí' : 'No (abrir desde el navegador)'}</b></div>
      </div>

      <h3>Respaldo</h3>
      <button className="btn block" onClick={() => downloadJson(trip)}>💾 Exportar JSON (con tus cambios)</button>

      <h3>Reemplazar itinerario</h3>
      <p className="muted small">Importar un JSON nuevo reemplaza el actual en este teléfono. Exporta primero si hiciste cambios.</p>
      <ImportScreen onImport={onImport} compact />

      <h3>Instalar en el teléfono</h3>
      <div className="card small">
        <p><b>Android (Chrome):</b> menú ⋮ → <i>Instalar app</i>.</p>
        <p><b>iPhone (Safari):</b> botón Compartir → <i>Agregar a pantalla de inicio</i>. Debe ser Safari.</p>
      </div>

      <button className="btn danger block" onClick={() => { if (confirm('¿Borrar el itinerario de este teléfono?')) onClear() }}>
        🗑️ Borrar datos de este teléfono
      </button>
    </>
  )
}
