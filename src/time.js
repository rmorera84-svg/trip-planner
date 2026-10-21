// Regla: se guarda en UTC, se muestra en la zona horaria del evento.
const LOCALE = 'es-CR'

export function fmtTime(iso, tz) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: tz || 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date(iso))
}

export function fmtDateTime(iso, tz) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: tz || 'UTC', weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date(iso))
}

export function fmtDay(date) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date(date + 'T12:00:00Z'))
}

export function fmtShortDate(date) {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'short' })
    .format(new Date(date + 'T12:00:00Z'))
}

export const cityOf = tz => (tz ? tz.split('/').pop().replace(/_/g, ' ') : '')

// ¿Qué día del viaje es "hoy" según el reloj del teléfono? (null si fuera del viaje)
export function todayInTrip(days, now = new Date()) {
  for (const d of days) {
    const tz = d.events.find(e => e.timezone)?.timezone || 'UTC'
    const local = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now)
    if (local === d.date) return d.date
  }
  return null
}
