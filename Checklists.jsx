import React from 'react'
import ChecklistCard from './ChecklistCard.jsx'

export default function Checklists({ trip, update }) {
  const lists = trip.checklists || []
  const total = lists.reduce((s, l) => s + l.items.length, 0)
  const done = lists.reduce((s, l) => s + l.items.filter(i => i.done).length, 0)
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">Preparación</div>
        <h1>Listas</h1>
        <div className="muted">{done} de {total} completados</div>
        <div className="progress trip"><div style={{ width: (total ? (done / total) * 100 : 0) + '%' }} /></div>
      </header>
      {lists.length === 0 && <p className="muted">Este viaje no tiene listas.</p>}
      {lists.map(c => <ChecklistCard key={c.id} list={c} update={update} startOpen={false} />)}
    </>
  )
}
