import React from 'react'
import { faqs, img } from '../data.js'
import { Photo } from '../components.jsx'

export default function About() {
  return (
    <div className="page">
      <div className="game-hero" style={{ marginBottom: 16 }}>
        <Photo src={img.neon} alt="About" />
        <div className="game-hero-copy"><h3>About Arena99</h3></div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <p>Arena99 is a premier-style online entertainment playground built for cricket nights, live tables and instant games. This demo recreates the lobby experience: sportsbook, exchange, casino, wallet, promos and leaderboards — fully playable with simulated credits.</p>
        <p style={{ marginTop: 10, color: '#9aa6b8' }}>No real money is involved. Play responsibly. 18+ only.</p>
      </div>
      <div className="section-head"><h3>Frequently Asked Questions</h3></div>
      <div className="faq">
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
