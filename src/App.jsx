import React, { useEffect, useState, useCallback } from 'react'
import { getItem, setItem, removeItem, requestPersistence } from './db.js'
import ImportScreen from './components/ImportScreen.jsx'
import TripHome from './components/TripHome.jsx'
import DayView from './components/DayView.jsx'
import EventDetail from './components/EventDetail.jsx'
import Checklists from './components/Checklists.jsx'
import Lodging from './components/Lodging.jsx'
import Reminders from './components/Reminders.jsx'
import Settings from './components/Settings.jsx'

const TABS = [
  { id: 'home', label: 'Viaje', icon: '🗺️' },
  { id: 'checklists', label: 'Listas', icon: '✅' },
  { id: 'lodging', label: 'Hoteles', icon: '🏨' },
  { id: 'reminders', label: 'Avisos', icon: '🔔' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' }
]

export default function App({ initialTrip = null }) {
  const [trip, setTrip] = useState(initialTrip)
  const [loading, setLoading] = useState(!initialTrip)
  const [stack, setStack] = useState([{ screen: 'home' }])
  const view = stack[stack.length - 1]

  useEffect(() => {
    if (initialTrip) return
    getItem('trip').then(t => { setTrip(t || null); setLoading(false) })
    requestPersistence()
  }, [initialTrip])

  // Botón "atrás" de Android / gesto de iPhone
  useEffect(() => {
    const onPop = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = useCallback(v => { history.pushState(null, ''); setStack(s => [...s, v]); window.scrollTo(0, 0) }, [])
  const back = useCallback(() => history.back(), [])
  const tab = id => { setStack([{ screen: id }]); window.scrollTo(0, 0) }

  // Guarda cualquier cambio (inmutable: clonamos antes de modificar)
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

  if (loading) return <div className="center muted">Cargando…</div>
  if (!trip) return <ImportScreen onImport={importTrip} />

  const props = { trip, go, back, update }
  let body
  switch (view.screen) {
    case 'day': body = <DayView {...props} date={view.date} />; break
    case 'event': body = <EventDetail {...props} id={view.id} />; break
    case 'checklists': body = <Checklists {...props} />; break
    case 'lodging': body = <Lodging {...props} />; break
    case 'reminders': body = <Reminders {...props} />; break
    case 'settings': body = <Settings {...props} onImport={importTrip} onClear={clearTrip} />; break
    default: body = <TripHome {...props} />
  }
  const activeTab = TABS.some(t => t.id === stack[0].screen) ? stack[0].screen : 'home'

  return (
    <div className="app">
      <main className="content">{body}</main>
      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.id} className={t.id === activeTab ? 'active' : ''} onClick={() => tab(t.id)}>
            <span className="ico">{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
