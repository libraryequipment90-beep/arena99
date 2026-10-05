import React, { createContext, useContext, useEffect, useState } from 'react'
import { img } from './data.js'
import { useStore } from './store.jsx'

const LiveCtx = createContext({ matches: [], updated: 0, err: '' })

const sportImg = {
  cricket: img.cricket,
  football: img.football,
  basketball: img.basketball,
  tennis: img.tennis
}

export function sportThumb(sport) {
  return sportImg[sport] || img.stadium
}

function runs(score) {
  const n = parseFloat(String(score || '').replace(',', '').match(/[\d.]+/)?.[0] || '0')
  return Number.isFinite(n) ? n : 0
}

export function oddsFor(m) {
  let a = 1.92
  let b = 1.92
  if (m.status === 'in') {
    const sa = runs(m.scoreA)
    const sb = runs(m.scoreB)
    if (sa > sb) { a = 1.48; b = 2.75 }
    else if (sb > sa) { a = 2.75; b = 1.48 }
    else { a = 1.95; b = 1.95 }
  }
  return {
    a: Number(a.toFixed(2)),
    b: Number(b.toFixed(2)),
    layA: Number((a + 0.06).toFixed(2)),
    layB: Number((b + 0.06).toFixed(2))
  }
}

export function useLiveMatches() {
  return useContext(LiveCtx)
}

function LiveSettler() {
  const { matches } = useLiveMatches()
  const { settleLive, user } = useStore()
  useEffect(() => {
    if (user && matches.length) settleLive(matches)
  }, [matches, user, settleLive])
  return null
}

export function LiveProvider({ children }) {
  const [matches, setMatches] = useState([])
  const [updated, setUpdated] = useState(0)
  const [err, setErr] = useState('')
  useEffect(() => {
    let stop = false
    async function load() {
      try {
        const r = await fetch('/api/live')
        const j = await r.json()
        if (stop) return
        setMatches(j.matches || [])
        setUpdated(j.updated || Date.now())
        setErr('')
      } catch {
        if (!stop) setErr('Live feed offline')
      }
    }
    load()
    const t = setInterval(load, 12000)
    return () => { stop = true; clearInterval(t) }
  }, [])
  return (
    <LiveCtx.Provider value={{ matches, updated, err }}>
      <LiveSettler />
      {children}
    </LiveCtx.Provider>
  )
}
