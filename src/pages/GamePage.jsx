import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { games } from '../data.js'
import { inr, useStore } from '../store.jsx'
import { Photo } from '../components.jsx'

const chips = [10, 50, 100, 250, 500, 1000]

export default function GamePage({ onAuth }) {
  const { id } = useParams()
  const game = games.find((g) => g.id === id) || games[0]
  const { user, placeBet, settle, notify } = useStore()
  const [stake, setStake] = useState(50)

  function mustLogin() {
    if (!user) {
      notify('Please login to continue')
      onAuth?.()
      return false
    }
    return true
  }

  function spinBet(pick, win, multiplier) {
    if (!mustLogin()) return null
    const r = placeBet({ game: game.id, pick, stake, odds: multiplier, meta: '' })
    if (!r.ok) {
      notify(r.error)
      return null
    }
    const payout = win && multiplier >= 1 ? Math.round(Number(stake) * multiplier) : 0
    settle(r.bet.id, payout > 0, payout)
    notify(win ? `${game.name}: won ${inr(payout)}` : `${game.name}: lost`)
    return { win, payout }
  }

  return (
    <div className="page">
      <div className="game-hero">
        <Photo src={game.img} alt={game.name} />
        <div className="game-hero-copy">
          <h3>{game.name}</h3>
          <Link className="more" to="/casino">Back to Lobby</Link>
        </div>
      </div>
      <div className="hud">
        <div>Balance <b>{user ? inr(user.balance) : '—'}</b></div>
        <div className="chip-row">
          {chips.map((n) => (
            <button key={n} className={'chip' + (Number(stake) === n ? ' on' : '')} onClick={() => setStake(n)}>{n}</button>
          ))}
        </div>
      </div>
      <Engine game={game} stake={stake} setStake={setStake} spinBet={spinBet} mustLogin={mustLogin} user={user} placeBet={placeBet} settle={settle} notify={notify} />
    </div>
  )
}

function Engine(props) {
  const map = {
    aviator: CrashGame,
    crash: CrashGame,
    roulette: RouletteGame,
    slots: SlotsGame,
    plinko: PlinkoGame,
    mines: MinesGame,
    color: ColorGame,
    wingo: ColorGame,
    coinflip: CoinFlip,
    dice: DiceGame,
    teenpatti: TeenPatti,
    dragontiger: DragonTiger,
    andarbahar: AndarBahar,
    blackjack: Blackjack,
    baccarat: Baccarat,
    crazytime: CrazyWheel
  }
  const C = map[props.game.play] || map[props.game.id] || CrashGame
  return <C {...props} />
}

function CrashGame({ stake, setStake, mustLogin, placeBet, settle, notify, game }) {
  const [mult, setMult] = useState(1)
  const [phase, setPhase] = useState('idle')
  const [crashAt, setCrashAt] = useState(0)
  const [cashed, setCashed] = useState(false)
  const betRef = useRef(null)
  const raf = useRef(0)

  function start() {
    if (!mustLogin()) return
    const r = placeBet({ game: game.id, pick: 'fly', stake, odds: 0, meta: '' })
    if (!r.ok) return notify(r.error)
    betRef.current = r.bet
    const target = Math.max(1.05, Number((-Math.log(1 - Math.random()) * 1.8 + 1).toFixed(2)))
    setCrashAt(target)
    setCashed(false)
    setPhase('flying')
    setMult(1)
    const t0 = performance.now()
    const loop = (now) => {
      const t = (now - t0) / 1000
      const m = Number((1 + t * 0.55 + t * t * 0.08).toFixed(2))
      if (m >= target) {
        setMult(target)
        setPhase('crash')
        if (betRef.current && !betRef.current._out) {
          settle(betRef.current.id, false, 0)
          notify('Crashed at ' + target.toFixed(2) + 'x')
        }
        return
      }
      setMult(m)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
  }

  function cash() {
    if (phase !== 'flying' || cashed || !betRef.current) return
    const payout = Math.round(Number(stake) * mult)
    betRef.current._out = true
    settle(betRef.current.id, true, payout)
    setCashed(true)
    setPhase('idle')
    cancelAnimationFrame(raf.current)
    notify('Cashed out ' + inr(payout) + ' at ' + mult.toFixed(2) + 'x')
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div className="game-shell">
      <canvas className="crash-canvas" ref={(el) => {
        if (!el) return
        const ctx = el.getContext('2d')
        el.width = el.clientWidth * 2
        el.height = 560
        ctx.fillStyle = '#0b1018'
        ctx.fillRect(0, 0, el.width, el.height)
        ctx.strokeStyle = phase === 'crash' ? '#ef4444' : '#f5c518'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(40, el.height - 40)
        const x = 40 + Math.min(el.width - 80, (mult - 1) * 180)
        const y = el.height - 40 - Math.min(el.height - 80, (mult - 1) * 90)
        ctx.quadraticCurveTo(x * 0.6, el.height - 40, x, y)
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.font = '48px Rajdhani'
        ctx.fillText(phase === 'crash' ? 'FLEW AWAY ' + crashAt.toFixed(2) + 'x' : '✈️ ' + mult.toFixed(2) + 'x', 50, 80)
      }} />
      <div className="hud">
        <div className="mult">{mult.toFixed(2)}x</div>
        <div className="row">
          <input type="number" value={stake} onChange={(e) => setStake(e.target.value)} style={{ width: 100, background: '#0f141c', color: '#fff', border: '1px solid #2a3344', borderRadius: 8, padding: 8 }} />
          {phase === 'flying'
            ? <button className="btn btn-green" onClick={cash} disabled={cashed}>Cash Out {inr(stake * mult)}</button>
            : <button className="btn btn-red" onClick={start}>Bet & Fly</button>}
        </div>
      </div>
    </div>
  )
}

function RouletteGame({ spinBet }) {
  const reds = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])
  const [sel, setSel] = useState([])
  const [last, setLast] = useState(null)

  function color(n) {
    if (n === 0) return 'green'
    return reds.has(n) ? 'red' : 'black'
  }

  function play(kind, payload) {
    const result = Math.floor(Math.random() * 37)
    setLast(result)
    let win = false
    let mult = 2
    if (kind === 'num') {
      win = payload.includes(result)
      mult = win ? Math.floor(36 / payload.length) : 2
    } else if (kind === 'color') win = color(result) === payload
    else if (kind === 'even') win = result !== 0 && result % 2 === 0
    else if (kind === 'odd') win = result % 2 === 1
    spinBet(kind + ' ' + payload, win, mult)
  }

  return (
    <div className="game-shell">
      <p style={{ marginBottom: 10 }}>Last: {last === null ? '—' : last} {last !== null ? color(last) : ''}</p>
      <div className="roulette-board">
        {Array.from({ length: 37 }, (_, n) => (
          <button key={n} className={'rnum ' + color(n) + (sel.includes(n) ? ' sel' : '')} onClick={() => setSel((s) => s.includes(n) ? s.filter((x) => x !== n) : [...s, n])}>{n}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-gold" onClick={() => sel.length && play('num', sel)}>Spin numbers</button>
        <button className="btn btn-red" onClick={() => play('color', 'red')}>Red x2</button>
        <button className="btn btn-ghost" onClick={() => play('color', 'black')}>Black x2</button>
        <button className="btn btn-ghost" onClick={() => play('even')}>Even</button>
        <button className="btn btn-ghost" onClick={() => play('odd')}>Odd</button>
      </div>
    </div>
  )
}

const SLOT_SYMS = ['🍒', '🍋', '🍉', '⭐', '7️⃣', '💎']

function SlotsGame({ stake, spinBet }) {
  const [reels, setReels] = useState(['🍒', '🍋', '🍉'])
  const [spinning, setSpinning] = useState(false)

  function spin() {
    if (spinning) return
    setSpinning(true)
    let n = 0
    const t = setInterval(() => {
      setReels([0, 1, 2].map(() => SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)]))
      n++
      if (n > 12) {
        clearInterval(t)
        const a = SLOT_SYMS[Math.floor(Math.random() * 6)]
        const b = SLOT_SYMS[Math.floor(Math.random() * 6)]
        const c = SLOT_SYMS[Math.floor(Math.random() * 6)]
        setReels([a, b, c])
        const win = a === b && b === c
        const pair = a === b || b === c || a === c
        spinBet(a + b + c, win || pair, win ? 12 : pair ? 2 : 0.0001)
        setSpinning(false)
      }
    }, 80)
  }

  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <div className="slot-row">{reels.map((r, i) => <div className="reel" key={i}>{r}</div>)}</div>
      <p style={{ color: '#9aa6b8' }}>3 alike x12 • 2 alike x2</p>
      <button className="btn btn-gold" onClick={spin} disabled={spinning}>Spin {inr(stake)}</button>
    </div>
  )
}

function PlinkoGame({ stake, spinBet }) {
  const bins = [9, 4, 2, 1.4, 1.1, 0.5, 1.1, 1.4, 2, 4, 9]
  const [drop, setDrop] = useState(5)

  function play() {
    let pos = 5
    for (let r = 0; r < 8; r++) pos += Math.random() < 0.5 ? -0.5 : 0.5
    const idx = Math.max(0, Math.min(10, Math.round(pos)))
    setDrop(idx)
    spinBet('bin ' + idx, bins[idx] >= 1, bins[idx])
  }

  return (
    <div className="game-shell">
      <div className="plinko-board">
        {Array.from({ length: 8 }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: 14, marginLeft: (8 - r) * 7 }}>
            {Array.from({ length: r + 3 }, (_, c) => <div className="peg" key={c} />)}
          </div>
        ))}
        <div className="bins">
          {bins.map((b, i) => <div className="bin" key={i} style={{ outline: drop === i ? '2px solid #f5c518' : 'none' }}>{b}x</div>)}
        </div>
      </div>
      <button className="btn btn-gold" style={{ marginTop: 12 }} onClick={play}>Drop Ball</button>
    </div>
  )
}

function MinesGame({ stake, mustLogin, placeBet, settle, notify, game }) {
  const [mines, setMines] = useState(3)
  const [board, setBoard] = useState([])
  const [alive, setAlive] = useState(false)
  const [revealed, setRevealed] = useState([])
  const betRef = useRef(null)

  function start() {
    if (!mustLogin()) return
    const r = placeBet({ game: game.id, pick: mines + ' mines', stake, odds: 1, meta: '' })
    if (!r.ok) return notify(r.error)
    betRef.current = r.bet
    const boom = new Set()
    while (boom.size < mines) boom.add(Math.floor(Math.random() * 25))
    setBoard([...boom])
    setRevealed([])
    setAlive(true)
  }

  const mult = useMemo(() => 1 + revealed.length * (0.35 + mines * 0.08), [revealed, mines])

  function click(i) {
    if (!alive) return
    if (revealed.includes(i)) return
    if (board.includes(i)) {
      setAlive(false)
      settle(betRef.current.id, false, 0)
      notify('Boom! Mine hit')
      setRevealed([...revealed, i])
      return
    }
    setRevealed([...revealed, i])
  }

  function cash() {
    if (!alive || !revealed.length) return
    const payout = Math.round(Number(stake) * mult)
    settle(betRef.current.id, true, payout)
    setAlive(false)
    notify('Cashed ' + inr(payout))
  }

  return (
    <div className="game-shell">
      <div className="row" style={{ marginBottom: 12 }}>
        <select value={mines} onChange={(e) => setMines(Number(e.target.value))} style={{ background: '#0f141c', color: '#fff', borderRadius: 8, padding: 8 }}>
          {[1, 3, 5, 8].map((n) => <option key={n} value={n}>{n} mines</option>)}
        </select>
        {!alive ? <button className="btn btn-gold" onClick={start}>Start</button> : <button className="btn btn-green" onClick={cash}>Cash {mult.toFixed(2)}x</button>}
      </div>
      <div className="mine-grid">
        {Array.from({ length: 25 }, (_, i) => {
          const open = revealed.includes(i) || (!alive && board.length)
          const boom = board.includes(i)
          return (
            <button key={i} className={'mine' + (open && boom ? ' boom' : open && !boom ? ' gem' : '')} onClick={() => click(i)}>
              {open ? (boom ? '💣' : '💎') : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ColorGame({ stake, spinBet }) {
  const [res, setRes] = useState(null)
  function play(c) {
    const roll = Math.random()
    const out = roll < 0.45 ? 'red' : roll < 0.9 ? 'green' : 'violet'
    setRes(out)
    spinBet(c, out === c, out === c ? (c === 'violet' ? 4.5 : 2) : 0.0001)
  }
  return (
    <div className="game-shell">
      <p style={{ marginBottom: 12 }}>Result: {res || '—'}</p>
      <div className="color-btns">
        <button className="c-red" onClick={() => play('red')}>Red x2</button>
        <button className="c-violet" onClick={() => play('violet')}>Violet x4.5</button>
        <button className="c-green" onClick={() => play('green')}>Green x2</button>
      </div>
      <p style={{ color: '#9aa6b8', marginTop: 10 }}>Stake {inr(stake)}</p>
    </div>
  )
}

function CoinFlip({ spinBet }) {
  const [side, setSide] = useState(null)
  function play(c) {
    const out = Math.random() < 0.5 ? 'heads' : 'tails'
    setSide(out)
    spinBet(c, out === c, 1.95)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 72, margin: 12 }}>{side === 'heads' ? '🪙' : side === 'tails' ? '⭕' : '❓'}</div>
      <p>{side || 'Call it'}</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
        <button className="btn btn-gold" onClick={() => play('heads')}>Heads</button>
        <button className="btn btn-ghost" onClick={() => play('tails')}>Tails</button>
      </div>
    </div>
  )
}

function DiceGame({ spinBet }) {
  const [over, setOver] = useState(50)
  const [roll, setRoll] = useState(null)
  function play() {
    const n = Math.floor(Math.random() * 100) + 1
    setRoll(n)
    const win = n > over
    const mult = Number((99 / (100 - over)).toFixed(2))
    spinBet('over ' + over, win, mult)
  }
  return (
    <div className="game-shell">
      <p>Roll: {roll ?? '—'}</p>
      <div className="field"><label>Over {over} • payout ~{(99 / (100 - over)).toFixed(2)}x</label>
        <input type="range" min="2" max="96" value={over} onChange={(e) => setOver(Number(e.target.value))} />
      </div>
      <button className="btn btn-gold" onClick={play}>Roll</button>
    </div>
  )
}

function deckDraw() {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const suits = ['♠', '♥', '♦', '♣']
  const r = ranks[Math.floor(Math.random() * 13)]
  const s = suits[Math.floor(Math.random() * 4)]
  const v = r === 'A' ? 14 : r === 'K' ? 13 : r === 'Q' ? 12 : r === 'J' ? 11 : Number(r)
  return { r, s, v, red: s === '♥' || s === '♦' }
}

function Card({ c }) {
  return <div className={'playing' + (c.red ? ' red' : '')}>{c.r}{c.s}</div>
}

function TeenPatti({ spinBet }) {
  const [me, setMe] = useState([])
  const [op, setOp] = useState([])
  function score(hand) {
    const vs = hand.map((h) => h.v).sort((a, b) => a - b)
    const trail = vs[0] === vs[2]
    const seq = vs[0] + 1 === vs[1] && vs[1] + 1 === vs[2]
    const pair = vs[0] === vs[1] || vs[1] === vs[2]
    const high = vs[2]
    return trail * 1000 + seq * 400 + pair * 100 + high
  }
  function play() {
    const a = [deckDraw(), deckDraw(), deckDraw()]
    const b = [deckDraw(), deckDraw(), deckDraw()]
    setMe(a); setOp(b)
    spinBet('teenpatti', score(a) >= score(b), 1.9)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <small>Dealer</small>
      <div className="cards">{op.map((c, i) => <Card key={i} c={c} />)}</div>
      <small>You</small>
      <div className="cards">{me.map((c, i) => <Card key={i} c={c} />)}</div>
      <button className="btn btn-gold" onClick={play}>Deal</button>
    </div>
  )
}

function DragonTiger({ spinBet }) {
  const [d, setD] = useState(null)
  const [t, setT] = useState(null)
  function play(side) {
    const a = deckDraw(); const b = deckDraw()
    setD(a); setT(b)
    const win = side === 'dragon' ? a.v > b.v : side === 'tiger' ? b.v > a.v : a.v === b.v
    spinBet(side, win, side === 'tie' ? 8 : 1.9)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <div className="cards">
        {d && <Card c={d} />}
        {t && <Card c={t} />}
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-red" onClick={() => play('dragon')}>Dragon</button>
        <button className="btn btn-ghost" onClick={() => play('tie')}>Tie x8</button>
        <button className="btn btn-gold" onClick={() => play('tiger')}>Tiger</button>
      </div>
    </div>
  )
}

function AndarBahar({ spinBet }) {
  const [joker, setJoker] = useState(null)
  const [side, setSide] = useState('')
  function play(s) {
    const j = deckDraw()
    setJoker(j)
    let hit = ''
    for (let i = 0; i < 12; i++) {
      const c = deckDraw()
      if (c.r === j.r) { hit = i % 2 === 0 ? 'andar' : 'bahar'; break }
    }
    if (!hit) hit = Math.random() < 0.5 ? 'andar' : 'bahar'
    setSide(hit)
    spinBet(s, hit === s, 1.9)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <p>Joker {joker ? `${joker.r}${joker.s}` : '—'}</p>
      <p>Winner: {side || '—'}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => play('andar')}>Andar</button>
        <button className="btn btn-gold" onClick={() => play('bahar')}>Bahar</button>
      </div>
    </div>
  )
}

function handVal(cards) {
  let t = 0, aces = 0
  cards.forEach((c) => {
    if (c.r === 'A') { aces++; t += 11 }
    else if (['K', 'Q', 'J'].includes(c.r)) t += 10
    else t += c.v > 10 ? 10 : c.v
  })
  while (t > 21 && aces) { t -= 10; aces-- }
  return t
}

function Blackjack({ stake, mustLogin, placeBet, settle, notify, game }) {
  const [p, setP] = useState([])
  const [d, setD] = useState([])
  const [live, setLive] = useState(false)
  const bet = useRef(null)

  function deal() {
    if (!mustLogin()) return
    const r = placeBet({ game: game.id, pick: 'bj', stake, odds: 2, meta: '' })
    if (!r.ok) return notify(r.error)
    bet.current = r.bet
    const pp = [deckDraw(), deckDraw()]
    const dd = [deckDraw(), deckDraw()]
    setP(pp); setD(dd); setLive(true)
    if (handVal(pp) === 21) finish(pp, dd, r.bet)
  }
  function hit() {
    const np = [...p, deckDraw()]
    setP(np)
    if (handVal(np) > 21) finish(np, d, bet.current)
  }
  function finish(pp, dd, b) {
    let dealer = [...dd]
    while (handVal(dealer) < 17) dealer.push(deckDraw())
    setD(dealer)
    const pv = handVal(pp), dv = handVal(dealer)
    const win = pv <= 21 && (dv > 21 || pv > dv)
    const push = pv === dv && pv <= 21
    const payout = push ? Number(stake) : win ? Math.round(Number(stake) * (pv === 21 && pp.length === 2 ? 2.5 : 2)) : 0
    settle(b.id, win || push, payout)
    notify(push ? 'Push' : win ? 'You win ' + inr(payout) : 'Dealer wins')
    setLive(false)
  }

  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <small>Dealer {d.length ? handVal(d) : ''}</small>
      <div className="cards">{d.map((c, i) => <Card key={i} c={c} />)}</div>
      <small>You {p.length ? handVal(p) : ''}</small>
      <div className="cards">{p.map((c, i) => <Card key={i} c={c} />)}</div>
      {!live ? <button className="btn btn-gold" onClick={deal}>Deal</button> : (
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={hit}>Hit</button>
          <button className="btn btn-gold" onClick={() => finish(p, d, bet.current)}>Stand</button>
        </div>
      )}
    </div>
  )
}

function Baccarat({ spinBet }) {
  const [p, setP] = useState(null)
  const [b, setB] = useState(null)
  function val(cs) { return cs.reduce((s, c) => s + (c.v >= 10 ? 0 : c.r === 'A' ? 1 : c.v), 0) % 10 }
  function play(side) {
    const pp = [deckDraw(), deckDraw()]
    const bb = [deckDraw(), deckDraw()]
    setP(val(pp)); setB(val(bb))
    const win = side === 'player' ? val(pp) > val(bb) : side === 'banker' ? val(bb) > val(pp) : val(pp) === val(bb)
    spinBet(side, win, side === 'tie' ? 8 : 1.9)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <p>Player {p ?? '—'} • Banker {b ?? '—'}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => play('player')}>Player</button>
        <button className="btn btn-gold" onClick={() => play('banker')}>Banker</button>
        <button className="btn btn-red" onClick={() => play('tie')}>Tie x8</button>
      </div>
    </div>
  )
}

function CrazyWheel({ spinBet }) {
  const slots = ['1', '1', '2', '2', '5', '5', '10', 'BONUS']
  const [land, setLand] = useState('—')
  function play() {
    const s = slots[Math.floor(Math.random() * slots.length)]
    setLand(s)
    const mult = s === 'BONUS' ? 15 : Number(s)
    spinBet(s, true, s === '1' ? 1 : mult)
  }
  return (
    <div className="game-shell" style={{ textAlign: 'center' }}>
      <div className="mult">{land}</div>
      <p>Wheel multipliers 1x 2x 5x 10x Bonus 15x</p>
      <button className="btn btn-gold" onClick={play}>Spin Wheel</button>
    </div>
  )
}
