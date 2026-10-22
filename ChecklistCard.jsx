import React, { useState } from 'react'
import { stamp } from '../trip.js'
import Icon from '../icons.jsx'

export default function ChecklistCard({ list, update, startOpen = true }) {
  const [open, setOpen] = useState(startOpen)
  const done = list.items.filter(i => i.done).length
  const pct = list.items.length ? Math.round((done / list.items.length) * 100) : 0

  const toggle = itemId => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
    update(t => {
      const l = t.checklists.find(c => c.id === list.id)
      const it = l.items.find(i => i.id === itemId)
      it.done = !it.done
      stamp(it)
    })
  }

  const groups = {}
  list.items.forEach(i => { (groups[i.category || 'general'] = groups[i.category || 'general'] || []).push(i) })

  return (
    <div className={'card checklist' + (pct === 100 ? ' complete' : '')}>
      <button className="row link-row" onClick={() => setOpen(!open)}>
        <h3><Icon name="check" size={18} /> {list.title}</h3>
        <span className={'pill ' + (pct === 100 ? 'green' : 'gray')}>{done}/{list.items.length}</span>
      </button>
      <div className="progress"><div style={{ width: pct + '%' }} /></div>
      {open && Object.entries(groups).map(([cat, items]) => (
        <div key={cat}>
          <div className="cat">{cat}</div>
          {items.map(i => (
            <label key={i.id} className={'check ' + (i.done ? 'done' : '')}>
              <input type="checkbox" checked={!!i.done} onChange={() => toggle(i.id)} />
              <span>{i.text}</span>
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}
