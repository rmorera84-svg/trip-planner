import React, { useEffect, useState } from 'react'
import { dayFares, DAILY_CAP_Z12 } from '../live.js'
import Icon from '../icons.jsx'

const gbp = x => (x == null ? '—' : '£' + x.toFixed(2))

// Resumen de metro de Londres del día con tope diario
export default function FareCard({ events, compact = false }) {
  const [state, setState] = useState({ loading: true })
  const key = events.map(e => e.id + e.start_utc).join('|')
  useEffect(() => {
    let alive = true
    setState({ loading: true })
    dayFares(events).then(r => alive && setState(r)).catch(() => alive && setState({ error: true }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (state.loading) return <div className="card"><div className="skeleton line" /></div>
  if (state.error || !state.legs || !state.legs.length) return null
  return (
    <div className="card fares">
      <div className="row">
        <h3><Icon name="ticket" size={18} /> Metro de Londres hoy</h3>
        <div className="fare-pay">{gbp(state.pay)}</div>
      </div>
      {state.capped && <div className="ok small">✓ Tope diario alcanzado: sumarían {gbp(state.total)}, pagas {gbp(DAILY_CAP_Z12)}</div>}
      {!compact && (
        <ul className="fare-legs">
          {state.legs.map(l => (
            <li key={l.id}>
              <span className="ellipsis">{l.title}</span>
              <span className={'pill ' + (l.peak ? 'amber' : 'gray')}>{l.peak ? 'Pico' : 'Valle'}</span>
              <b>{gbp(l.fare)}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="muted tiny">Contactless por persona · toca al entrar y al salir · Fuente: TfL</div>
    </div>
  )
}
