import React from 'react'
import ChecklistCard from './ChecklistCard.jsx'

export default function Checklists({ trip, update }) {
  const lists = trip.checklists || []
  return (
    <>
      <h1>Listas</h1>
      {lists.length === 0 && <p className="muted">Este viaje no tiene listas.</p>}
      {lists.map(c => <ChecklistCard key={c.id} list={c} update={update} startOpen={false} />)}
    </>
  )
}
