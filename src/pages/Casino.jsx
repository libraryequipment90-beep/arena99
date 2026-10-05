import React, { useMemo, useState } from 'react'
import { cats, games, providers } from '../data.js'
import { GameCard, Photo } from '../components.jsx'

export default function Casino() {
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    return games.filter((g) => {
      const okCat = cat === 'all' ? true : cat === 'trending' ? g.hot : g.cat === cat
      return okCat && g.name.toLowerCase().includes(q.toLowerCase())
    })
  }, [cat, q])

  return (
    <div className="page">
      <div className="section-head"><h3>Casino Lobby</h3></div>
      <input className="search" placeholder="Search games" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="tabs">
        {cats.map((c) => (
          <button key={c} className={'tab' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="grid g-4">
        {list.map((g) => <GameCard key={g.id} g={g} />)}
      </div>
      {!list.length && <p style={{ color: '#9aa6b8' }}>No games in this filter.</p>}
      <div className="section">
        <h3>All Providers</h3>
        <div className="providers" style={{ marginTop: 10 }}>
          {providers.map((p) => (
            <div className="provider" key={p.name}>
              <Photo src={p.img} alt={p.name} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
