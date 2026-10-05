import React from 'react'
import { games } from '../data.js'
import { GameCard } from '../components.jsx'

export default function LiveCasino() {
  const live = games.filter((g) => ['live', 'table', 'cards'].includes(g.cat))
  return (
    <div className="page">
      <div className="section-head"><h3>Live Casino</h3></div>
      <p style={{ color: '#9aa6b8', marginBottom: 14 }}>Studio-style tables with instant settlement. Demo dealers, real-feeling pace.</p>
      <div className="grid g-4">
        {live.map((g) => <GameCard key={g.id} g={g} />)}
      </div>
    </div>
  )
}
