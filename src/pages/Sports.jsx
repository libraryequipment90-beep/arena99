import React, { useMemo, useState } from 'react'
import { sports } from '../data.js'
import { inr, useStore } from '../store.jsx'
import { Photo } from '../components.jsx'
import { oddsFor, sportThumb, useLiveMatches } from '../live.jsx'

function badge(m) {
  if (m.status === 'in') return { cls: 'live', text: 'LIVE' }
  if (m.status === 'post') return { cls: 'done', text: 'FT' }
  return { cls: 'soon', text: m.league }
}

export default function Sports() {
  const { user, placeBet, notify } = useStore()
  const { matches, err, updated } = useLiveMatches()
  const [sport, setSport] = useState('all')
  const [slip, setSlip] = useState(null)
  const [stake, setStake] = useState(100)
  const list = useMemo(() => matches.filter((m) => sport === 'all' || m.sport === sport), [sport, matches])

  function pick(m, label, odd) {
    if (m.status === 'post') return notify('Match already finished')
    setSlip({ m, label, odd })
  }

  function confirm() {
    if (!user) return notify('Please login to continue')
    if (slip.m.status === 'post') return notify('Match already finished')
    const n = Number(stake)
    if (!Number.isFinite(n) || n < 10) return notify('Minimum stake is ₹10')
    const r = placeBet({
      game: 'sportsbook',
      pick: `${slip.m.a} vs ${slip.m.b} • ${slip.label}`,
      stake: n,
      odds: slip.odd,
      meta: { matchId: slip.m.id, team: slip.label, side: 'back' }
    })
    if (!r.ok) return notify(r.error)
    notify('Bet placed. Settles when the live match ends.')
    setSlip(null)
  }

  return (
    <div className="page">
      <div className="grid g-sports" style={{ gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <div className="section-head"><h3>Sportsbook</h3></div>
          <p className="live-note">Live ESPN scores. Bets settle on the real result when the match ends. Casino games stay demo RNG.</p>
          {err && <p className="live-note warn">{err}</p>}
          {updated ? <p className="live-note">Updated {new Date(updated).toLocaleTimeString()}</p> : null}
          <div className="tabs">
            <button className={'tab' + (sport === 'all' ? ' on' : '')} onClick={() => setSport('all')}>All</button>
            {sports.map((s) => (
              <button key={s.id} className={'tab' + (sport === s.id ? ' on' : '')} onClick={() => setSport(s.id)}>{s.name}</button>
            ))}
          </div>
          <div className="card">
            {!list.length && <p className="live-note">No live events for this sport right now.</p>}
            {list.map((m) => {
              const o = oddsFor(m)
              const bd = badge(m)
              const closed = m.status === 'post'
              return (
                <div className="match-row" key={m.id}>
                  <Photo src={sportThumb(m.sport)} alt={m.a} className="match-thumb" />
                  <div className="odds" style={{ border: 0, flex: 1, padding: 0 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={'badge ' + bd.cls}>{bd.text}</span>
                        <b>{m.a} vs {m.b}</b>
                      </div>
                      <small style={{ color: '#9aa6b8' }}>
                        {m.league} • {m.clock || 'Match Winner'}
                        {(m.scoreA || m.scoreB) ? ` • ${m.scoreA || '0'} - ${m.scoreB || '0'}` : ''}
                        {closed && m.winner ? ` • Winner ${m.winner}` : ''}
                        {closed && m.void ? ' • Void / No result' : ''}
                      </small>
                    </div>
                    <button className="od" disabled={closed} onClick={() => pick(m, m.a, o.a)}>{o.a.toFixed(2)}</button>
                    <button className="od" disabled={closed} onClick={() => pick(m, m.b, o.b)}>{o.b.toFixed(2)}</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="slip">
          <h3>Bet Slip</h3>
          {!slip && <p style={{ color: '#9aa6b8', marginTop: 10 }}>Tap an odd to add a selection. Settlement waits for full-time.</p>}
          {slip && (
            <>
              <Photo src={sportThumb(slip.m.sport)} alt="" className="slip-img" />
              <p style={{ margin: '10px 0' }}><b>{slip.m.a} vs {slip.m.b}</b><br /><small>{slip.label} @ {slip.odd}</small></p>
              <div className="field"><label>Stake</label><input type="number" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
              <div className="chip-row" style={{ marginBottom: 10 }}>
                {[50, 100, 250, 500, 1000].map((n) => <button key={n} className="chip" onClick={() => setStake(n)}>{n}</button>)}
              </div>
              <p style={{ marginBottom: 10 }}>Potential return <b>{inr((Number(stake) || 0) * slip.odd)}</b></p>
              <button className="btn btn-gold" style={{ width: '100%' }} onClick={confirm}>Place Bet</button>
            </>
          )}
          {user && (
            <div style={{ marginTop: 16 }}>
              <h4>Open / Recent</h4>
              {user.bets.filter((b) => b.game === 'sportsbook').slice(0, 8).map((b) => (
                <p key={b.id} style={{ fontSize: 12, marginTop: 6 }}>{b.pick} • {b.status} • {inr(b.stake)}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
