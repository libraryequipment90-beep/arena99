import React from 'react'
import { inr, useStore } from '../store.jsx'

export default function Profile({ onAuth }) {
  const { user } = useStore()
  if (!user) {
    return (
      <div className="page">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h3>Account</h3>
          <p style={{ color: '#9aa6b8', margin: '10px 0' }}>Login to view your profile.</p>
          <button className="btn btn-gold" onClick={onAuth}>Login</button>
        </div>
      </div>
    )
  }
  return (
    <div className="page">
      <div className="section-head"><h3>My Account</h3></div>
      <div className="grid g-3" style={{ marginBottom: 16 }}>
        <div className="stat"><small>Player</small><b>{user.name}</b></div>
        <div className="stat"><small>Mobile</small><b>{user.phone}</b></div>
        <div className="stat"><small>VIP</small><b>{user.vip}</b></div>
      </div>
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="table">
          <thead><tr><th>Game</th><th>Pick</th><th>Stake</th><th>Status</th><th>PnL</th></tr></thead>
          <tbody>
            {user.bets.slice(0, 30).map((b) => (
              <tr key={b.id}>
                <td>{b.game}</td>
                <td>{b.pick}</td>
                <td>{inr(b.stake)}</td>
                <td>{b.status}</td>
                <td style={{ color: b.pnl >= 0 ? '#22c55e' : '#f87171' }}>{inr(b.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!user.bets.length && <p style={{ padding: 16, color: '#9aa6b8' }}>No bets yet.</p>}
      </div>
    </div>
  )
}
