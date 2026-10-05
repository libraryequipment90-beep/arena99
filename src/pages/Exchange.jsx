import React, { useState } from 'react'
import { inr, useStore } from '../store.jsx'
import { Photo } from '../components.jsx'
import { oddsFor, sportThumb, useLiveMatches } from '../live.jsx'

function badge(m) {
  if (m.status === 'in') return { cls: 'live', text: 'IN-PLAY' }
  if (m.status === 'post') return { cls: 'done', text: 'FT' }
  return { cls: 'soon', text: 'PREMATCH' }
}

export default function Exchange() {
  const { user, placeBet, notify } = useStore()
  const { matches, err } = useLiveMatches()
  const [sel, setSel] = useState(null)
  const [stake, setStake] = useState(200)

  function take(m, side, team, odd) {
    if (m.status === 'post') return notify('Match already finished')
    setSel({ m, side, team, odd })
  }

  function confirm() {
    if (!user) return notify('Please login to continue')
    if (sel.m.status === 'post') return notify('Match already finished')
    const r = placeBet({
      game: 'exchange',
      pick: `${sel.side.toUpperCase()} ${sel.team}`,
      stake,
      odds: sel.odd,
      meta: { matchId: sel.m.id, team: sel.team, side: sel.side }
    })
    if (!r.ok) return notify(r.error)
    notify('Order matched. Settles from the live result at full-time. 4% commission on net wins.')
    setSel(null)
  }

  return (
    <div className="page">
      <div className="section-head"><h3>Sports Exchange</h3></div>
      <p style={{ color: '#9aa6b8', marginBottom: 12 }}>Blue = Back, Pink = Lay. Live scores. 4% commission on net wins after the match ends.</p>
      {err && <p className="live-note warn">{err}</p>}
      <div className="grid g-sports" style={{ gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div className="card">
          <div className="odds" style={{ fontSize: 12, color: '#9aa6b8' }}>
            <div>Event</div><div>Back</div><div>Lay</div>
          </div>
          {!matches.length && <p className="live-note">Waiting for live markets…</p>}
          {matches.map((m) => {
            const o = oddsFor(m)
            const bd = badge(m)
            const closed = m.status === 'post'
            return (
              <div key={m.id} style={{ borderBottom: '1px solid #2a3344', padding: 10 }}>
                <div className="match-row" style={{ marginBottom: 8 }}>
                  <Photo src={sportThumb(m.sport)} alt="" className="match-thumb" />
                  <div>
                    <b>{m.a} vs {m.b}</b>
                    <div>
                      <span className={'badge ' + bd.cls}>{bd.text}</span>
                      <small style={{ color: '#9aa6b8', marginLeft: 8 }}>
                        {m.league}{(m.scoreA || m.scoreB) ? ` • ${m.scoreA || '0'} - ${m.scoreB || '0'}` : ''}
                        {closed && m.winner ? ` • ${m.winner}` : ''}
                      </small>
                    </div>
                  </div>
                </div>
                {[{ t: m.a, b: o.a, l: o.layA }, { t: m.b, b: o.b, l: o.layB }].map((row) => (
                  <div className="odds" key={row.t} style={{ padding: '6px 0' }}>
                    <div>{row.t}</div>
                    <button className="od back" disabled={closed} onClick={() => take(m, 'back', row.t, row.b)}>{row.b.toFixed(2)}</button>
                    <button className="od lay" disabled={closed} onClick={() => take(m, 'lay', row.t, row.l)}>{row.l.toFixed(2)}</button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        <div className="slip">
          <h3>Exchange Slip</h3>
          {!sel && <p style={{ color: '#9aa6b8', marginTop: 10 }}>Select Back or Lay. Result follows the live match.</p>}
          {sel && (
            <>
              <Photo src={sportThumb(sel.m.sport)} alt="" className="slip-img" />
              <p style={{ margin: '10px 0' }}><b>{sel.side.toUpperCase()}</b> {sel.team}<br />@{sel.odd}</p>
              <div className="field"><label>Stake / Liability</label><input type="number" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
              <p style={{ marginBottom: 10 }}>Est. profit <b>{inr(stake * (sel.odd - 1))}</b></p>
              <button className="btn btn-gold" style={{ width: '100%' }} onClick={confirm}>Confirm</button>
            </>
          )}
          {user && (
            <div style={{ marginTop: 16 }}>
              <h4>Open / Recent</h4>
              {user.bets.filter((b) => b.game === 'exchange').slice(0, 8).map((b) => (
                <p key={b.id} style={{ fontSize: 12, marginTop: 6 }}>{b.pick} • {b.status} • {inr(b.stake)}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
