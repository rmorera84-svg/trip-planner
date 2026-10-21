// Utilidades sobre el JSON del viaje.
export const TYPE_ICON = {
  transport: '🚆', flight: '✈️', food: '🍽️', sight: '📍',
  lodging: '🏨', logistics: '🧳', meetup: '👋'
}

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

export function nextEvent(trip, now = new Date()) {
  const iso = now.toISOString()
  return allEvents(trip).find(e => e.start_utc && e.start_utc >= iso && e.status !== 'alternative') || null
}

export function travelerNames(trip, ids) {
  if (!ids) return ''
  const map = Object.fromEntries((trip.travelers || []).map(t => [t.id, t.name]))
  return ids.map(id => map[id] || id).join(', ')
}

export const checklistFor = (trip, eventId) =>
  (trip.checklists || []).filter(c => c.event_id === eventId)

export const lodgingById = (trip, id) => (trip.lodging || []).find(l => l.id === id)

export function costText(cost) {
  if (!cost || cost.min == null) return null
  const sym = { EUR: '€', GBP: '£', CZK: 'Kč ', USD: '$' }[cost.currency] || (cost.currency + ' ')
  const range = cost.max != null && cost.max !== cost.min ? `${sym}${cost.min}–${sym}${cost.max}` : `${sym}${cost.min}`
  return range + (cost.per === 'group' ? ' (grupo)' : ' p/p')
}

// Cambios locales: suben version y updated_at (listo para la sincronización de la semana 3).
export function stamp(obj, by) {
  obj.version = (obj.version || 0) + 1
  obj.updated_at = new Date().toISOString()
  if (by) obj.updated_by = by
  return obj
}

export function downloadJson(trip) {
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  const stampStr = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
  a.download = `${(trip.trip && trip.trip.id) || 'trip'}-${stampStr}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
