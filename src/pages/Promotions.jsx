import React from 'react'
import { promos } from '../data.js'
import { useStore } from '../store.jsx'
import { Photo } from '../components.jsx'

export default function Promotions() {
  const { user, claimPromo, notify } = useStore()
  return (
    <div className="page">
      <div className="section-head"><h3>Promotions</h3></div>
      <div className="grid g-3">
        {promos.map((p) => (
          <div className="card promo-card" key={p.code}>
            <Photo src={p.img} alt={p.title} />
            <div style={{ padding: 16 }}>
              <span className="badge live">{p.tag}</span>
              <h3 style={{ margin: '10px 0 6px' }}>{p.title}</h3>
              <p style={{ color: '#9aa6b8', marginBottom: 12 }}>{p.desc}</p>
              <button className="btn btn-gold" onClick={() => {
                if (!user) return notify('Please login to continue')
                const r = claimPromo(p.code, p.amount)
                if (!r.ok) notify(r.error)
              }}>Let's Go</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
