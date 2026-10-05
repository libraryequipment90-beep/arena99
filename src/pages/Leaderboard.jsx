import React from 'react'
import { inr, useStore } from '../store.jsx'

export default function Leaderboard() {
  const { leaders, user } = useStore()
  const rows = [...leaders]
  if (user) rows.push({ name: user.name + ' (You)', city: 'Arena', won: Math.max(0, user.balance - 5000 + user.withdrawn) })
  rows.sort((a, b) => b.won - a.won)
  return (
    <div className="page">
      <div className="section-head"><h3>Leaderboards</h3></div>
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="table">
          <thead><tr><th>#</th><th>Player</th><th>City</th><th>Winnings</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name}><td>{i + 1}</td><td>{r.name}</td><td>{r.city}</td><td>{inr(r.won)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
