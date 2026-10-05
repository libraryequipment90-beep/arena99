import React from 'react'
import { img } from '../data.js'
import { inr, useStore } from '../store.jsx'
import { Photo } from '../components.jsx'

export default function Refer() {
  const { user, addReferral, notify } = useStore()
  return (
    <div className="page">
      <div className="game-hero" style={{ marginBottom: 16 }}>
        <Photo src={img.crowd} alt="Refer" />
        <div className="game-hero-copy"><h3>Refer & Earn</h3></div>
      </div>
      <div className="grid g-3">
        <div className="stat"><small>Your code</small><b>{user?.refCode || 'LOGIN'}</b></div>
        <div className="stat"><small>Referrals</small><b>{user?.referrals || 0}</b></div>
        <div className="stat"><small>Reward / friend</small><b>{inr(250)}</b></div>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <p>Share your code. When a friend signs up, both of you get ₹250 demo credits.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-gold" onClick={() => {
            if (!user) return notify('Please login to continue')
            navigator.clipboard?.writeText(user.refCode)
            notify('Code copied')
          }}>Copy Code</button>
          <button className="btn btn-ghost" onClick={() => {
            if (!user) return notify('Please login to continue')
            addReferral()
          }}>Simulate Friend Join</button>
        </div>
      </div>
    </div>
  )
}
