import React from 'react'
import { wmo } from '../theme.js'
import Icon from '../icons.jsx'

const KIND = { forecast: 'Pronóstico', typical: 'Típico (mismo día del año pasado)', actual: 'Clima registrado' }
const deg = x => (x == null ? '–' : Math.round(x) + '°')

// Chip compacto para la línea de tiempo
export function WeatherChip({ wx, loading }) {
  if (loading) return <span className="wx-chip skeleton">&nbsp;</span>
  if (!wx) return null
  const w = wmo(wx.code)
  return (
    <span className={'wx-chip' + (wx.kind !== 'forecast' ? ' typical' : '')} title={KIND[wx.kind]}>
      {w.icon} {deg(wx.temp)}
      {wx.pop != null && wx.pop >= 20 && <span className="wx-pop">{wx.pop}%</span>}
      {wx.kind === 'typical' && <span className="wx-tag">típico</span>}
    </span>
  )
}

// Tarjeta detallada para el detalle del evento
export function WeatherCard({ wx, loading }) {
  if (loading) return <div className="card"><div className="skeleton line" /><div className="skeleton line short" /></div>
  if (!wx) return null
  const w = wmo(wx.code)
  return (
    <div className="card weather">
      <div className="wx-main">
        <div className="wx-icon">{w.icon}</div>
        <div>
          <div className="wx-temp">{deg(wx.temp)}</div>
          <div className="muted small">{w.label} · se siente {deg(wx.feels)}</div>
        </div>
      </div>
      <div className="wx-stats">
        {wx.pop != null && <span><Icon name="drop" size={16} /> {wx.pop}% lluvia</span>}
        {wx.pop == null && wx.precip != null && <span><Icon name="drop" size={16} /> {wx.precip} mm</span>}
        {wx.wind != null && <span><Icon name="wind" size={16} /> {Math.round(wx.wind)} km/h</span>}
      </div>
      <div className="muted tiny">
        {KIND[wx.kind]}{wx.kind === 'typical' && ' — el pronóstico real aparece 16 días antes'}
        {!wx.fresh && ' · sin señal, dato guardado'}
      </div>
    </div>
  )
}
