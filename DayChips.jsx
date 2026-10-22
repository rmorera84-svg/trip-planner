import React, { useEffect, useRef } from 'react'
import { fmtChip } from '../time.js'
import { dayCountry } from '../trip.js'
import { countryInfo } from '../theme.js'

// Barra horizontal de días (Jue 12 · Vie 13 · …)
export default function DayChips({ days, active, today, onPick }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current && ref.current.querySelector('.chip.active')
    if (el && el.scrollIntoView) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])
  return (
    <div className="chips" ref={ref}>
      {days.map(d => {
        const c = fmtChip(d.date)
        const info = countryInfo(dayCountry(d))
        return (
          <button key={d.date} className={'chip' + (d.date === active ? ' active' : '') + (d.date === today ? ' today' : '')}
            style={{ '--chip': info.color }} onClick={() => onPick(d.date)}>
            <span className="wd">{c.wd}</span>
            <span className="dn">{c.d}</span>
            <span className="fl">{info.flag}</span>
          </button>
        )
      })}
    </div>
  )
}
