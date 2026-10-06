import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'arena99_v1'
const StoreCtx = createContext(null)

const seedLeaders = [
  { name: 'Rahul G.', city: 'Noida', won: 186400 },
  { name: 'Amit T.', city: 'Lucknow', won: 142250 },
  { name: 'Kartik M.', city: 'Chennai', won: 97800 },
  { name: 'Suraj V.', city: 'Mumbai', won: 86420 },
  { name: 'Prakash M.', city: 'Pune', won: 72110 },
  { name: 'Neha S.', city: 'Delhi', won: 65400 },
  { name: 'Imran K.', city: 'Hyderabad', won: 58990 },
  { name: 'Anjali P.', city: 'Jaipur', won: 51230 }
]

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    user: null,
    users: {}
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const api = useMemo(() => {
    const withUser = (fn) => {
      let snapshot = null
      setState((s) => {
        if (!s.user) return s
        snapshot = s.user
        const next = fn(s.user)
        if (!next || next === s.user) return s
        return { ...s, users: { ...s.users, [next.phone]: next }, user: next }
      })
      return snapshot
    }

    return {
      toast,
      notify: (msg) => setToast(msg),
      user: state.user,
      leaders: seedLeaders,

      registerOrLogin(phone, name) {
        const clean = String(phone).replace(/\D/g, '').slice(-10)
        if (clean.length !== 10) return { ok: false, error: 'Enter a valid 10-digit mobile number' }
        setState((s) => {
          const existing = s.users[clean]
          const user = existing || {
            phone: clean,
            name: name || `Player ${clean.slice(-4)}`,
            balance: 5000,
            bonus: 500,
            wagered: 0,
            deposited: 0,
            withdrawn: 0,
            bets: [],
            tx: [{ id: Date.now(), type: 'bonus', amount: 5000, note: 'Welcome demo credits', at: Date.now() }],
            referrals: 0,
            refCode: 'A99' + clean.slice(-4),
            joined: Date.now(),
            vip: 'Silver'
          }
          return { ...s, users: { ...s.users, [clean]: user }, user }
        })
        setToast('Logged in successfully')
        return { ok: true }
      },

      logout() {
        setState((s) => ({ ...s, user: null }))
        setToast('Logged out')
      },

      deposit(amount, method) {
        const n = Number(amount)
        if (!state.user) return { ok: false, error: 'Login required' }
        if (!Number.isFinite(n) || n < 500) return { ok: false, error: 'Minimum deposit is ₹500' }
        let bonus = 0
        const ok = withUser((u) => {
          bonus = u.deposited === 0 ? Math.min(n * 0.5, 10000) : 0
          return {
            ...u,
            balance: u.balance + n + bonus,
            bonus: u.bonus + bonus,
            deposited: u.deposited + n,
            tx: [
              { id: Date.now(), type: 'deposit', amount: n, note: method, at: Date.now() },
              ...(bonus ? [{ id: Date.now() + 1, type: 'bonus', amount: bonus, note: 'First deposit bonus', at: Date.now() }] : []),
              ...u.tx
            ]
          }
        })
        if (!ok) return { ok: false, error: 'Login required' }
        setToast(bonus ? `Deposited ₹${n} + ₹${bonus} bonus` : `Deposited ₹${n}`)
        return { ok: true }
      },

      withdraw(amount, method) {
        const n = Number(amount)
        if (!state.user) return { ok: false, error: 'Login required' }
        if (!Number.isFinite(n) || n < 1000) return { ok: false, error: 'Minimum withdrawal is ₹1000' }
        let err = ''
        const ok = withUser((u) => {
          if (n > u.balance) { err = 'Insufficient balance'; return null }
          if (u.wagered < u.deposited) { err = 'Complete wagering on deposits before withdrawal'; return null }
          return {
            ...u,
            balance: u.balance - n,
            withdrawn: u.withdrawn + n,
            tx: [{ id: Date.now(), type: 'withdraw', amount: n, note: method, at: Date.now() }, ...u.tx]
          }
        })
        if (err) return { ok: false, error: err }
        if (!ok) return { ok: false, error: 'Login required' }
        setToast(`Withdrawal of ₹${n} submitted`)
        return { ok: true }
      },

      placeBet({ game, pick, stake, odds, meta }) {
        if (!state.user) return { ok: false, error: 'Login required' }
        const n = Number(stake)
        if (!Number.isFinite(n) || n < 10) return { ok: false, error: 'Minimum stake is ₹10' }
        const bet = {
          id: Date.now() + Math.random(),
          game, pick, stake: n, odds, meta, status: 'open', pnl: 0, at: Date.now()
        }
        let err = ''
        const ok = withUser((u) => {
          if (n > u.balance) { err = 'Insufficient balance'; return null }
          return {
            ...u,
            balance: u.balance - n,
            wagered: u.wagered + n,
            bets: [bet, ...u.bets]
          }
        })
        if (err) return { ok: false, error: err }
        if (!ok) return { ok: false, error: 'Login required' }
        return { ok: true, bet }
      },

      settle(betId, won, payout) {
        withUser((u) => {
          const bet = u.bets.find((b) => b.id === betId)
          if (!bet || bet.status !== 'open') return u
          const pay = Number(payout) || 0
          const bets = u.bets.map((b) => {
            if (b.id !== betId) return b
            return { ...b, status: won ? 'won' : 'lost', pnl: won ? pay - b.stake : -b.stake }
          })
          return { ...u, bets, balance: won ? u.balance + pay : u.balance }
        })
      },

      settleLive(matches) {
        if (!matches || !matches.length) return
        withUser((u) => {
          let balance = u.balance
          let changed = false
          const bets = u.bets.map((b) => {
            if (b.status !== 'open') return b
            if (b.game !== 'sportsbook' && b.game !== 'exchange') return b
            const meta = b.meta && typeof b.meta === 'object' ? b.meta : { matchId: b.meta, team: b.pick }
            const m = matches.find((x) => x.id === meta.matchId)
            if (!m || m.status !== 'post') return b
            changed = true
            if (m.void || !m.winner) {
              balance += b.stake
              return { ...b, status: 'void', pnl: 0 }
            }
            const team = meta.team || ''
            const pickedWins = String(team).trim().toLowerCase() === String(m.winner).trim().toLowerCase()
            const won = b.game === 'exchange' && meta.side === 'lay' ? !pickedWins : pickedWins
            if (!won) return { ...b, status: 'lost', pnl: -b.stake }
            const gross = Math.round(b.stake * (Number(b.odds) - 1))
            const commission = b.game === 'exchange' ? Math.round(gross * 0.04) : 0
            const payout = b.stake + gross - commission
            balance += payout
            return { ...b, status: 'won', pnl: payout - b.stake }
          })
          if (!changed) return u
          return { ...u, bets, balance }
        })
      },

      addReferral() {
        withUser((u) => ({
          ...u,
          referrals: u.referrals + 1,
          balance: u.balance + 250,
          tx: [{ id: Date.now(), type: 'bonus', amount: 250, note: 'Referral reward', at: Date.now() }, ...u.tx]
        }))
        setToast('Referral credited ₹250')
      },

      claimPromo(code, amount) {
        if (!state.user) return { ok: false, error: 'Login required' }
        const key = 'claimed_' + code
        let err = ''
        const ok = withUser((u) => {
          if (u[key]) { err = 'Already claimed'; return null }
          return {
            ...u,
            [key]: true,
            balance: u.balance + amount,
            bonus: u.bonus + amount,
            tx: [{ id: Date.now(), type: 'bonus', amount, note: 'Promo ' + code, at: Date.now() }, ...u.tx]
          }
        })
        if (err) return { ok: false, error: err }
        if (!ok) return { ok: false, error: 'Login required' }
        setToast(`Claimed ₹${amount}`)
        return { ok: true }
      }
    }
  }, [state, toast])

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}

export function useStore() {
  return useContext(StoreCtx)
}

export function inr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}
