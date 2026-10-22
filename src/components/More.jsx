import React from 'react'
import Icon from '../icons.jsx'

export default function More({ trip, go }) {
  const pending = (trip.reminders || []).filter(r => !r.done).length
  const items = [
    { screen: 'lodging', icon: 'bed', label: 'Hoteles', sub: `${(trip.lodging || []).length} alojamientos` },
    { screen: 'reminders', icon: 'bell', label: 'Avisos', sub: `${pending} pendientes` },
    { screen: 'settings', icon: 'sliders', label: 'Ajustes', sub: 'Respaldo, importar, eliminados' }
  ]
  return (
    <>
      <header className="page-head"><div className="eyebrow">Trip Planner</div><h1>Más</h1></header>
      <div className="menu-list">
        {items.map(i => (
          <button key={i.screen} className="menu-item" onClick={() => go({ screen: i.screen })}>
            <span className="menu-ico"><Icon name={i.icon} /></span>
            <span><b>{i.label}</b><span className="muted small">{i.sub}</span></span>
            <Icon name="right" className="muted" />
          </button>
        ))}
      </div>
    </>
  )
}
