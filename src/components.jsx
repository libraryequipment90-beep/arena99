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

export function GameCard({ g }) {
  return (
    <Link className="game-card" to={'/game/' + g.id}>
      <div className="game-art">
        <Photo src={g.img} alt={g.name} />
        {g.hot && <span className="badge live art-badge">HOT</span>}
      </div>
      <div className="game-meta">
        <b>{g.name}</b>
        <small>{g.cat}</small>
      </div>
      <div className="play-now"><span>Play Now</span></div>
    </Link>
  )
}
