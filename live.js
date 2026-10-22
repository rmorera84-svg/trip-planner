// Datos en vivo (APIs gratuitas) con caché local para usar sin señal.
import { getItem, setItem } from './db.js'
import { localParts } from './time.js'

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

// Devuelve { t, data, fresh } — usa caché si es reciente o si no hay señal
async function cached(key, ttlMs, fetcher) {
  const c = await getItem('cache:' + key)
  if (c && Date.now() - c.t < ttlMs) return { ...c, fresh: true }
  if (c && !online()) return { ...c, fresh: false }
  try {
    const v = { t: Date.now(), data: await fetcher() }
    await setItem('cache:' + key, v)
    return { ...v, fresh: true }
  } catch (e) {
    if (c) return { ...c, fresh: false }
    throw e
  }
}

/* ---------- Clima (Open-Meteo) ---------- */
const r2 = x => Math.round(x * 100) / 100
const HOURLY_F = 'temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m'
const HOURLY_A = 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'

// Plan de consulta para una fecha UTC: pronóstico (≤ 15 días) o "típico" (mismo día del año anterior)
export function weatherPlan(lat, lng, utcDate, now = Date.now()) {
  const la = r2(lat), lo = r2(lng)
  const days = (Date.parse(utcDate + 'T00:00:00Z') - now) / 864e5
  if (days >= -2 && days <= 15) {
    return {
      kind: 'forecast', key: `wx:f:${la},${lo},${utcDate}`, ttl: 3 * 3600e3, shift: 0,
      url: `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&hourly=${HOURLY_F}&timezone=GMT&start_date=${utcDate}&end_date=${utcDate}`
    }
  }
  const past = days < -2
  const d = past ? utcDate : `${Number(utcDate.slice(0, 4)) - 1}${utcDate.slice(4)}`
  return {
    kind: past ? 'actual' : 'typical', key: `wx:a:${la},${lo},${d}`, ttl: 365 * 864e5, shift: past ? 0 : 1,
    url: `https://archive-api.open-meteo.com/v1/archive?latitude=${la}&longitude=${lo}&hourly=${HOURLY_A}&timezone=GMT&start_date=${d}&end_date=${d}`
  }
}

// Extrae el clima de la hora del evento
export function weatherAt(data, iso, shift = 0) {
  if (!data || !data.hourly || !iso) return null
  const y = Number(iso.slice(0, 4)) - shift
  const key = `${y}${iso.slice(4, 13)}:00`
  const i = data.hourly.time.indexOf(key)
  if (i < 0) return null
  const h = data.hourly
  const pick = k => (h[k] ? h[k][i] : null)
  return {
    temp: pick('temperature_2m'), feels: pick('apparent_temperature'),
    pop: pick('precipitation_probability'), precip: pick('precipitation'),
    code: pick('weather_code'), wind: pick('wind_speed_10m')
  }
}

export async function weatherForEvent(e) {
  const loc = e.location
  if (!loc || loc.lat == null || !e.start_utc) return null
  const plan = weatherPlan(loc.lat, loc.lng, e.start_utc.slice(0, 10))
  const res = await cached(plan.key, plan.ttl, () => getJson(plan.url))
  const wx = weatherAt(res.data, e.start_utc, plan.shift)
  return wx ? { ...wx, kind: plan.kind, t: res.t, fresh: res.fresh } : null
}

/* ---------- Tarifas del metro de Londres (TfL) ---------- */
const num = x => (x == null || x === '' ? null : Number(x))

export function parseTflFare(data) {
  const tickets = (((data || [])[0] || {}).rows || [{}])[0].ticketsAvailable || []
  const payg = tickets.filter(t => t.ticketType && t.ticketType.type === 'Pay as you go')
  const by = type => num((payg.find(t => t.ticketTime && t.ticketTime.type === type) || {}).cost)
  return { peak: by('Peak'), offPeak: by('Off Peak') }
}

// Hora pico: lunes a viernes 06:30–09:30 y 16:00–19:00 (hora de Londres)
export function isPeak(iso) {
  const p = localParts(iso, 'Europe/London')
  if (p.weekday === 'Sat' || p.weekday === 'Sun') return false
  const m = p.hour * 60 + p.minute
  return (m >= 390 && m < 570) || (m >= 960 && m < 1140)
}

export const tflLeg = e => {
  const t = e.live && e.live.transit
  return t && t.provider === 'tfl' && /^940/.test(t.from || '') && /^940/.test(t.to || '') ? t : null
}

export async function tflFare(from, to) {
  const res = await cached(`fare:${from}:${to}`, 7 * 864e5,
    () => getJson(`https://api.tfl.gov.uk/StopPoint/${from}/FareTo/${to}`))
  return { ...parseTflFare(res.data), t: res.t, fresh: res.fresh }
}

export const DAILY_CAP_Z12 = 8.9

// Suma del día con tope diario (zonas 1–2)
export function fareSummary(legs) {
  const total = legs.reduce((s, l) => s + (l.fare || 0), 0)
  const zone12 = legs.length > 0 && legs.every(l => l.fare != null && l.fare <= 3.6)
  const pay = zone12 ? Math.min(total, DAILY_CAP_Z12) : total
  return { total: Math.round(total * 100) / 100, pay: Math.round(pay * 100) / 100, capped: zone12 && total > DAILY_CAP_Z12, zone12 }
}

export async function dayFares(events) {
  const legs = []
  for (const e of events) {
    const t = tflLeg(e)
    if (!t || !e.start_utc) continue
    try {
      const f = await tflFare(t.from, t.to)
      const peak = isPeak(e.start_utc)
      legs.push({ id: e.id, title: e.title, peak, fare: peak ? f.peak : f.offPeak, t: f.t })
    } catch {
      legs.push({ id: e.id, title: e.title, peak: isPeak(e.start_utc), fare: null })
    }
  }
  return { legs, ...fareSummary(legs) }
}

/* ---------- Gasolina en Austria (E-Control) ---------- */
export function parseFuel(data) {
  return (data || [])
    .filter(s => s.open && s.prices && s.prices.length)
    .map(s => {
      const pm = s.paymentMethods || {}
      const cards = [pm.creditCard && 'Tarjeta', pm.cash && 'Efectivo'].filter(Boolean).join(', ') ||
        (pm.others || '').split(',').map(x => x.trim()).filter(x => /VISA|MASTER|MAESTRO|AMEX/i.test(x)).join(', ')
      return {
        id: s.id, name: s.name, address: s.location.address, city: s.location.city,
        lat: s.location.latitude, lng: s.location.longitude,
        price: s.prices[0].amount, label: s.prices[0].label, distance: s.distance, pay: cards
      }
    })
    .sort((a, b) => a.price - b.price || a.distance - b.distance)
    .slice(0, 3)
}

export async function fuelAustria(lat, lng, type = 'SUP') {
  const url = `https://api.e-control.at/sprit/1.0/search/gas-stations/by-address?latitude=${r2(lat)}&longitude=${r2(lng)}&fuelType=${type}&includeClosed=false`
  const res = await cached(`fuel:${r2(lat)},${r2(lng)},${type}`, 30 * 60e3, () => getJson(url))
  return { stations: parseFuel(res.data), t: res.t, fresh: res.fresh }
}
