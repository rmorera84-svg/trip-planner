// Regla: se guarda en UTC, se muestra en la zona horaria del evento.
const LOCALE = 'es-CR'

const fmt = (iso, tz, opts) =>
  iso ? new Intl.DateTimeFormat(LOCALE, { timeZone: tz || 'UTC', ...opts }).format(new Date(iso)) : '—'

export const fmtTime = (iso, tz) => fmt(iso, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const fmtDateTime = (iso, tz) =>
  fmt(iso, tz, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const fmtDay = date => fmt(date + 'T12:00:00Z', 'UTC', { weekday: 'long', day: 'numeric', month: 'long' })
export const fmtShortDate = date => fmt(date + 'T12:00:00Z', 'UTC', { day: 'numeric', month: 'short' })
export const fmtChip = date => ({
  wd: fmt(date + 'T12:00:00Z', 'UTC', { weekday: 'short' }).replace('.', ''),
  d: Number(date.slice(8, 10))
})

export const cityOf = tz => (tz ? tz.split('/').pop().replace(/_/g, ' ') : '')

// Partes de fecha/hora de un instante en una zona horaria
export function localParts(iso, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short'
  }).formatToParts(new Date(iso))
  const o = {}
  parts.forEach(p => { o[p.type] = p.value })
  const hour = Number(o.hour) % 24
  return {
    date: `${o.year}-${o.month}-${o.day}`,
    time: `${String(hour).padStart(2, '0')}:${o.minute}`,
    hour, minute: Number(o.minute), weekday: o.weekday
  }
}

function tzOffsetMs(ms, tz) {
  const p = localParts(new Date(ms).toISOString(), tz)
  const [y, m, d] = p.date.split('-').map(Number)
  return Date.UTC(y, m - 1, d, p.hour, p.minute) - Math.floor(ms / 60000) * 60000
}

// Hora local (fecha + "HH:MM") en una zona → ISO UTC
export function zonedToUtc(date, time, tz) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const off1 = tzOffsetMs(guess, tz)
  let ms = guess - off1
  const off2 = tzOffsetMs(ms, tz)
  if (off2 !== off1) ms = guess - off2
  return new Date(ms).toISOString().replace('.000Z', 'Z')
}

export function durationText(min) {
  if (min < 60) return `${Math.round(min)} min`
  const h = Math.floor(min / 60), m = Math.round(min % 60)
  return m ? `${h} h ${m} min` : `${h} h`
}

export function countdownText(ms) {
  const min = ms / 60000
  if (min < 1) return 'ahora'
  if (min < 60 * 24) return 'en ' + durationText(min)
  const days = Math.round(min / 1440)
  return days === 1 ? 'mañana' : `en ${days} días`
}

// ¿Qué día del viaje es "hoy" según el reloj del teléfono? (null si fuera del viaje)
export function todayInTrip(days, now = new Date()) {
  for (const d of days) {
    const tz = (d.events.find(e => e.timezone) || {}).timezone || 'UTC'
    if (localParts(now.toISOString(), tz).date === d.date) return d.date
  }
  return null
}
