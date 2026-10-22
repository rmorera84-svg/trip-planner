// Utilidades sobre el JSON del viaje.
export function validateTrip(t) {
  const errors = []
  if (!t || typeof t !== 'object') errors.push('El archivo no es un objeto JSON.')
  else {
    if (!t.trip || !t.trip.name) errors.push('Falta "trip.name".')
    if (!Array.isArray(t.days) || t.days.length === 0) errors.push('Falta la lista "days".')
    else if (!t.days.every(d => d.date && Array.isArray(d.events))) errors.push('Cada día necesita "date" y "events".')
  }
  return errors
}

export const visibleEvents = day =>
  (day.events || [])
    .filter(e => !e.deleted)
    .sort((a, b) => (a.start_utc || '9999').localeCompare(b.start_utc || '9999'))

export function allEvents(trip) {
  return trip.days.flatMap(d => visibleEvents(d).map(e => ({ ...e, _date: d.date })))
}

export function findEvent(trip, id) {
  for (const d of trip.days) {
    const e = (d.events || []).find(x => x.id === id)
    if (e) return { event: e, day: d }
  }
  return null
}

export const dayTz = day => ((day.events || []).find(e => e.timezone && !e.deleted) || {}).timezone || 'UTC'

// País "dominante" del día (para el color de acento)
export function dayCountry(day) {
  const count = {}
  ;(day.events || []).forEach(e => {
    if (e.deleted || e.type === 'flight') return
    const c = e.location && e.location.country
    if (c) count[c] = (count[c] || 0) + 1
  })
  const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0]
  return best ? best[0] : null
}

// Eventos sin hora de fin: duran hasta el siguiente del mismo día, o 2 h si es el último
const plus2h = iso => new Date(Date.parse(iso) + 2 * 3600e3).toISOString()
const endOf = (e, next) => e.end_utc || (next && next._date === e._date ? next.start_utc : plus2h(e.start_utc))

// Evento en curso y el siguiente
export function currentAndNext(trip, now = new Date()) {
  const iso = now.toISOString()
  const evs = allEvents(trip).filter(e => e.start_utc && e.status !== 'alternative')
  let current = null, next = null
  for (let i = 0; i < evs.length; i++) {
    const e = evs[i], end = endOf(e, evs[i + 1])
    if (e.start_utc <= iso && end && end > iso) current = e
    if (e.start_utc > iso) { next = e; break }
  }
  return { current, next }
}

export const eventState = (e, nextE, nowIso) => {
  if (!e.start_utc) return ''
  const end = e.end_utc || (nextE && nextE.start_utc) || plus2h(e.start_utc)
  if (end <= nowIso) return 'past'
  if (e.start_utc <= nowIso) return 'now'
  return ''
}

export function travelerNames(trip, ids) {
  if (!ids) return ''
  const map = Object.fromEntries((trip.travelers || []).map(t => [t.id, t.name]))
  return ids.map(id => map[id] || id).join(', ')
}

export const checklistFor = (trip, eventId) => (trip.checklists || []).filter(c => c.event_id === eventId)
export const lodgingById = (trip, id) => (trip.lodging || []).find(l => l.id === id)
export const lodgingTonight = (trip, date) =>
  (trip.lodging || []).find(h => h.check_in <= date && date < h.check_out) || null

export function costText(cost) {
  if (!cost || cost.min == null) return null
  const sym = { EUR: '€', GBP: '£', CZK: 'Kč ', USD: '$' }[cost.currency] || (cost.currency + ' ')
  const range = cost.max != null && cost.max !== cost.min ? `${sym}${cost.min}–${sym}${cost.max}` : `${sym}${cost.min}`
  return range + (cost.per === 'group' ? ' (grupo)' : ' p/p')
}

export const mapsDir = loc =>
  loc && loc.lat != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((loc && loc.name) || '')}`

// Cambios locales: suben version y updated_at (listo para sincronizar en la semana 3)
export function stamp(obj, by) {
  obj.version = (obj.version || 0) + 1
  obj.updated_at = new Date().toISOString()
  if (by) obj.updated_by = by
  return obj
}

export const newId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)

// Inserta o reemplaza un evento y lo mueve al día indicado
export function upsertEvent(trip, date, event) {
  trip.days.forEach(d => { d.events = d.events.filter(e => e.id !== event.id) })
  const day = trip.days.find(d => d.date === date)
  if (!day) throw new Error('Día no encontrado: ' + date)
  day.events.push(event)
  day.events.sort((a, b) => (a.start_utc || '9999').localeCompare(b.start_utc || '9999'))
}

export function setDeleted(trip, id, deleted) {
  const f = findEvent(trip, id)
  if (f) { f.event.deleted = deleted; stamp(f.event) }
}

export const deletedEvents = trip =>
  trip.days.flatMap(d => d.events.filter(e => e.deleted).map(e => ({ ...e, _date: d.date })))

export function downloadJson(trip) {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  const s = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  a.download = `${(trip.trip && trip.trip.id) || 'trip'}-${s}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
