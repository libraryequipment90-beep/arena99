import React from 'react'
import { Link } from 'react-router-dom'

export function Photo({ src, alt, className }) {
  return (
    <img
      className={className || ''}
      src={src}
      alt={alt || ''}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        e.currentTarget.src = '/img/casino.jpg'
      }}
    />
  )
}

export function isLiveTable(g) {
  return ['live', 'table', 'cards'].includes(g?.cat)
}

export function GameCard({ g }) {
  const live = isLiveTable(g)
  return (
    <Link className="game-card" to={'/game/' + g.id}>
      <div className="game-art">
        <Photo src={g.img} alt={g.name} />
        {live ? <span className="badge live art-badge">LIVE</span> : g.hot ? <span className="badge live art-badge">HOT</span> : null}
      </div>
      <div className="game-meta">
        <b>{g.name}</b>
        <small>{live ? 'Live table • Join now' : g.cat}</small>
      </div>
      <div className="play-now"><span>{live ? 'Join Table' : 'Play Now'}</span></div>
    </Link>
  )
}
