import React, { useEffect, useState, useCallback } from 'react'
import { getItem, setItem, removeItem, requestPersistence } from './db.js'
import { todayInTrip } from './time.js'
import { dayCountry, findEvent, currentAndNext } from './trip.js'
import { countryInfo, DEFAULT_ACCENT } from './theme.js'
import Icon from './icons.jsx'
import ImportScreen from './components/ImportScreen.jsx'
import Home from './components/Home.jsx'
import DayView from './components/DayView.jsx'
import EventDetail from './components/EventDetail.jsx'
import EventEditor from './components/EventEditor.jsx'
import MapView from './components/MapView.jsx'
import Checklists from './components/Checklists.jsx'
import More from './components/More.jsx'
import Lodging from './components/Lodging.jsx'
import Reminders from './components/Reminders.jsx'
import Settings from './components/Settings.jsx'

const TABS = [
  { id: 'home', label: 'Hoy', icon: 'home' },
  { id: 'days', label: 'Itinerario', icon: 'calendar' },
  { id: 'map', label: 'Mapa', icon: 'map' },
  { id: 'lists', label: 'Listas', icon: 'check' },
  { id: 'more', label: 'Más', icon: 'menu' }
]

// País del contexto actual → color de acento de toda la app
function accentFor(trip, view) {
  if (!trip) return DEFAULT_ACCENT
  const pickDay = date => trip.days.find(d => d.date === date)
  let c = null
  if (view.screen === 'days' || view.screen === 'map') {
    const d = pickDay(view.date) || pickDay(todayInTrip(trip.days)) || trip.days[0]
    c = dayCountry(d)
  } else if (view.screen === 'event') {
    const f = findEvent(trip, view.id)
    c = f && f.event.location && f.event.location.country
  } else {
    const { next } = currentAndNext(trip)
    const d = pickDay(todayInTrip(trip.days)) || (next && pickDay(next._date)) || trip.days[0]
    c = dayCountry(d)
  }
  return c ? countryInfo(c).color : DEFAULT_ACCENT
}

export default function App({ initialTrip = null }) {
  const [trip, setTrip] = useState(initialTrip)
  const [loading, setLoading] = useState(!initialTrip)
  const [stack, setStack] = useState([{ screen: 'home' }])
  const [editor, setEditor] = useState(null)
  const [fuelType, setFuelTypeState] = useState(() =>
    (typeof localStorage !== 'undefined' && localStorage.getItem('fuelType')) || 'SUP')
  const view = stack[stack.length - 1]

  useEffect(() => {
    if (initialTrip) return
    getItem('trip').then(t => { setTrip(t || null); setLoading(false) })
    requestPersistence()
  }, [initialTrip])

  // Botón "atrás" de Android / gesto de iPhone
  useEffect(() => {
    const onPop = () => {
      if (editor) { setEditor(null); return }
      setStack(s => (s.length > 1 ? s.slice(0, -1) : s))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [editor])

  const go = useCallback(v => { history.pushState(null, ''); setStack(s => [...s, v]); window.scrollTo(0, 0) }, [])
  const replace = useCallback(v => setStack(s => [...s.slice(0, -1), v]), [])
  const back = useCallback(() => history.back(), [])
  const tab = id => {
    setStack([id === 'days' || id === 'map' ? { screen: id, date: trip && todayInTrip(trip.days) } : { screen: id }])
    window.scrollTo(0, 0)
  }
  const setFuelType = v => { setFuelTypeState(v); try { localStorage.setItem('fuelType', v) } catch { /* ignorar */ } }

  // Guarda cualquier cambio (clonamos antes de modificar)
  const update = useCallback(mutator => {
    setTrip(prev => {
      const next = structuredClone(prev)
      mutator(next)
      setItem('trip', next)
      return next
    })
  }, [])

  const importTrip = async t => { await setItem('trip', t); setTrip(t); setStack([{ screen: 'home' }]) }
  const clearTrip = async () => { await removeItem('trip'); setTrip(null) }

  if (loading) return <div className="splash"><Icon name="plane" size={40} /></div>
  if (!trip) return <ImportScreen onImport={importTrip} />

  const openEditor = opts => setEditor(opts)
  const props = { trip, go, back, replace, update, openEditor, fuelType }
  let body
  switch (view.screen) {
    case 'days': body = <DayView {...props} date={view.date} />; break
    case 'event': body = <EventDetail key={view.id} {...props} id={view.id} />; break
    case 'map': body = <MapView {...props} date={view.date} />; break
    case 'lists': body = <Checklists {...props} />; break
    case 'more': body = <More {...props} />; break
    case 'lodging': body = <Lodging {...props} />; break
    case 'reminders': body = <Reminders {...props} />; break
    case 'settings': body = <Settings {...props} onImport={importTrip} onClear={clearTrip} setFuelType={setFuelType} />; break
    default: body = <Home {...props} />
  }
  const activeTab = TABS.some(t => t.id === stack[0].screen) ? stack[0].screen : 'home'
  const accent = accentFor(trip, view)

  return (
    <div className={'app screen-' + view.screen} style={{ '--accent': accent }}>
      <div className="bg-glow" />
      <main className="content" key={view.screen + (view.id || view.date || '')}>{body}</main>
      <nav className="tabbar glass">
        {TABS.map(t => (
          <button key={t.id} className={t.id === activeTab ? 'active' : ''} onClick={() => tab(t.id)}>
            <Icon name={t.icon} size={22} stroke={t.id === activeTab ? 2.4 : 1.8} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {editor && <EventEditor trip={trip} date={editor.date} event={editor.event} update={update} onClose={() => setEditor(null)} />}
    </div>
  )
}
