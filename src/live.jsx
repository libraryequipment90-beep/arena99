import React, { createContext, useContext, useEffect, useState } from 'react'
import { useStore } from './store.jsx'

export { oddsFor, sportThumb } from './live.js'

const LiveCtx = createContext({ matches: [], updated: 0, err: '' })

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
