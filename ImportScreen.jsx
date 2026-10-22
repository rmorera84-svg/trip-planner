import React, { useState } from 'react'
import { validateTrip } from '../trip.js'
import Icon from '../icons.jsx'

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
    <div className={compact ? '' : 'welcome'}>
      {!compact && <>
        <div className="welcome-logo"><Icon name="plane" size={44} /></div>
        <h1>Trip Planner</h1>
        <p className="muted">Tu itinerario, offline y con datos en vivo.<br />Los datos se guardan solo en este teléfono.</p>
      </>}
      <label className="btn primary block">
        <Icon name="upload" size={18} /> Importar itinerario (.json)
        <input type="file" accept="application/json,.json" onChange={onFile} hidden />
      </label>
      {!compact && <button className="btn block" onClick={loadSample}>Ver viaje de ejemplo</button>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
