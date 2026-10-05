import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { games, img, providers, quotes, slides } from '../data.js'
import { GameCard, Photo } from '../components.jsx'

export default function Home() {
  const [i, setI] = useState(0)
  const [q, setQ] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 4500)
    const t2 = setInterval(() => setQ((x) => (x + 1) % quotes.length), 5000)
    return () => { clearInterval(t); clearInterval(t2) }
  }, [])

  const s = slides[i]
  const qt = quotes[q]

  return (
    <div className="page">
      <div className="carousel">
        <div className="slide" style={{ backgroundImage: `url(${s.img})` }}>
          <div className="slide-copy">
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link className="btn btn-gold" to={s.to}>Claim Now</Link>
          </div>
        </div>
        <button className="car-nav prev" onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)}>‹</button>
        <button className="car-nav next" onClick={() => setI((x) => (x + 1) % slides.length)}>›</button>
      </div>
      <div className="dots">
        {slides.map((_, n) => <button key={n} className={'dot' + (n === i ? ' on' : '')} onClick={() => setI(n)} />)}
      </div>

      <div className="section">
        <div className="providers">
          {providers.map((p) => (
            <div className="provider" key={p.name}>
              <Photo src={p.img} alt={p.name} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g-2 section">
        <Link to="/sports" className="big-tile">
          <Photo src={img.cricket} alt="Sportsbook" />
          <div className="tile-copy">
            <span className="badge live">LIVE</span>
            <h2>Sportsbook</h2>
            <p>Live ESPN scores. Bets settle on the real full-time result.</p>
          </div>
        </Link>
        <Link to="/exchange" className="big-tile">
          <Photo src={img.stadium} alt="Exchange" />
          <div className="tile-copy">
            <span className="badge soon">EXCHANGE</span>
            <h2>Sports Exchange</h2>
            <p>Back and lay like a trading desk. 4% demo commission on net wins.</p>
          </div>
        </Link>
      </div>

      <Section title="Trending" to="/casino" list={games.filter((g) => g.hot)} />
      <Section title="Live Casino" to="/live" list={games.filter((g) => g.cat === 'live' || g.cat === 'table' || g.id === 'teenpatti')} />
      <Section title="Casino" to="/casino" list={games.filter((g) => ['slots', 'instant', 'crash', 'color'].includes(g.cat))} />

      <div className="section">
        <div className="section-head"><h3>Top Providers</h3></div>
        <p style={{ color: '#9aa6b8', marginBottom: 10 }}>Enjoy your favourite live games with studio-style tables and instant titles.</p>
        <div className="providers">
          {providers.map((p) => (
            <div className="provider" key={'b-' + p.name}>
              <Photo src={p.img} alt={p.name} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section card quote">
        <Photo src={qt.img} alt={qt.n} className="avatar" />
        <div>
          <p>"{qt.t}"</p>
          <small>{qt.n} • {qt.c}</small>
        </div>
      </div>
    </div>
  )
}

function Section({ title, to, list }) {
  return (
    <div className="section">
      <div className="section-head">
        <h3>{title}</h3>
        <Link className="more" to={to}>More</Link>
      </div>
      <div className="grid g-4">
        {list.slice(0, 8).map((g) => <GameCard key={g.id} g={g} />)}
      </div>
    </div>
  )
}
