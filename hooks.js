import { useEffect, useState } from 'react'
import { weatherForEvent } from './live.js'

// Reloj que se actualiza cada minuto
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

// Clima de varios eventos (con caché); devuelve { [eventId]: wx | null }
export function useWeather(events, refreshKey = 0) {
  const [map, setMap] = useState({})
  const ids = events.map(e => e.id + (e.start_utc || '') + ((e.location && e.location.lat) || '')).join('|')
  useEffect(() => {
    let alive = true
    setMap({})
    ;(async () => {
      for (const e of events) {
        try {
          const wx = await weatherForEvent(e)
          if (!alive) return
          setMap(m => ({ ...m, [e.id]: wx }))
        } catch {
          if (alive) setMap(m => ({ ...m, [e.id]: null }))
        }
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, refreshKey])
  return map
}
