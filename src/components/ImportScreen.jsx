import React, { useState } from 'react'
import { validateTrip } from '../trip.js'

export default function ImportScreen({ onImport, compact = false }) {
  const [error, setError] = useState(null)

  const handle = async text => {
    try {
      const t = JSON.parse(text)
      const errs = validateTrip(t)
      if (errs.length) return setError(errs.join(' '))
      setError(null)
      await onImport(t)
    } catch (e) {
      setError('No se pudo leer el JSON: ' + e.message)
    }
  }
  const onFile = e => {
    const f = e.target.files && e.target.files[0]
    if (f) f.text().then(handle)
    e.target.value = ''
  }
  const loadSample = async () => {
    const res = await fetch(import.meta.env.BASE_URL + 'sample-trip.json')
    handle(await res.text())
  }

  return (
    <div className={compact ? '' : 'center-page'}>
      {!compact && <>
        <div className="logo">🗺️</div>
        <h1>Trip Planner</h1>
        <p className="muted">Tus datos se guardan solo en este teléfono.</p>
      </>}
      <label className="btn primary block">
        📂 Importar itinerario (.json)
        <input type="file" accept="application/json,.json" onChange={onFile} hidden />
      </label>
      {!compact && <button className="btn block" onClick={loadSample}>Ver viaje de ejemplo</button>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
