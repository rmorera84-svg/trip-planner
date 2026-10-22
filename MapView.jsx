import React, { useEffect, useRef, useState } from 'react'
import { visibleEvents, lodgingTonight, dayCountry } from '../trip.js'
import { todayInTrip, fmtTime } from '../time.js'
import { typeInfo, countryInfo } from '../theme.js'
import DayChips from './DayChips.jsx'
import Icon from '../icons.jsx'

const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Mapa del día con Leaflet + OpenStreetMap (gratis, sin llave)
export default function MapView({ trip, date, go, replace }) {
  const today = todayInTrip(trip.days)
  const day = trip.days.find(d => d.date === date) || trip.days.find(d => d.date === today) || trip.days[0]
  const el = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const meRef = useRef(null)
  const [err, setErr] = useState(null)
  const evs = visibleEvents(day).filter(e => e.location && e.location.lat != null && e.type !== 'flight')
  const hotel = lodgingTonight(trip, day.date)
  const country = countryInfo(dayCountry(day))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        await import('leaflet/dist/leaflet.css')
        if (cancelled) return
        if (!mapRef.current) {
          mapRef.current = L.map(el.current, { zoomControl: false, attributionControl: true })
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, attribution: '© OpenStreetMap'
          }).addTo(mapRef.current)
        }
        const map = mapRef.current
        if (layerRef.current) layerRef.current.remove()
        const layer = L.layerGroup().addTo(map)
        layerRef.current = layer
        const pts = []
        evs.forEach((e, i) => {
          const t = typeInfo(e.type)
          const ll = [e.location.lat, e.location.lng]
          pts.push(ll)
          L.marker(ll, {
            icon: L.divIcon({ className: '', html: `<div class="map-pin" style="--type:${t.color}">${i + 1}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] })
          }).addTo(layer).bindPopup(`<b>${esc(fmtTime(e.start_utc, e.timezone))} · ${esc(e.title)}</b><br>${esc(e.location.name)}<br><a href="#" data-ev="${esc(e.id)}">Ver detalle</a>`)
        })
        if (pts.length > 1) L.polyline(pts, { color: country.color, weight: 3, opacity: .7, dashArray: '6 8' }).addTo(layer)
        if (hotel && hotel.lat != null) {
          L.marker([hotel.lat, hotel.lng], {
            icon: L.divIcon({ className: '', html: '<div class="map-pin hotel">🏨</div>', iconSize: [30, 30], iconAnchor: [15, 15] })
          }).addTo(layer).bindPopup(`<b>${esc(hotel.name)}</b><br>${esc(hotel.address)}`)
          pts.push([hotel.lat, hotel.lng])
        }
        if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 })
        else map.setView([48.5, 8], 4)
        setTimeout(() => map.invalidateSize(), 50)
      } catch (e) {
        if (!cancelled) setErr('No se pudo cargar el mapa: ' + e.message)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.date, evs.length])

  // Clic en "Ver detalle" dentro del popup
  useEffect(() => {
    const node = el.current
    if (!node) return
    const onClick = ev => {
      const id = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-ev')
      if (id) { ev.preventDefault(); go({ screen: 'event', id }) }
    }
    node.addEventListener('click', onClick)
    return () => node.removeEventListener('click', onClick)
  }, [go])

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }, [])

  const locate = async () => {
    if (!navigator.geolocation || !mapRef.current) return
    const L = (await import('leaflet')).default
    navigator.geolocation.getCurrentPosition(p => {
      const ll = [p.coords.latitude, p.coords.longitude]
      if (meRef.current) meRef.current.remove()
      meRef.current = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(mapRef.current)
      mapRef.current.setView(ll, 15)
    }, () => setErr('No se pudo obtener tu ubicación.'), { enableHighAccuracy: true, timeout: 10000 })
  }

  return (
    <div className="map-page">
      <DayChips days={trip.days} active={day.date} today={today} onPick={d => replace({ screen: 'map', date: d })} />
      <div className="map-wrap">
        <div ref={el} className="map" />
        <button className="icon-btn glass map-locate" onClick={locate} aria-label="Mi ubicación"><Icon name="locate" /></button>
        <div className="map-legend glass">{country.flag} {day.area} · {evs.length} lugares</div>
      </div>
      {err && <p className="error small">{err}</p>}
      <p className="muted tiny center-text">Los mapas que ya viste quedan guardados para usarlos sin señal.</p>
    </div>
  )
}
