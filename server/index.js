import http from 'http'

const PORT = 3001
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

const SOURCES = [
  { sport: 'football', league: 'EPL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { sport: 'football', league: 'La Liga', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard' },
  { sport: 'football', league: 'Bundesliga', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard' },
  { sport: 'football', league: 'Serie A', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard' },
  { sport: 'football', league: 'UCL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { sport: 'basketball', league: 'NBA', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  { sport: 'tennis', league: 'ATP', url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard' }
]

let cache = { matches: [], updated: 0 }

async function grab(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(url + ' ' + r.status)
  return r.json()
}

function teamName(t) {
  return t?.displayName || t?.team?.displayName || t?.athlete?.displayName || t?.name || ''
}

function scoreOf(t) {
  if (t?.score != null && t.score !== '') return String(t.score)
  if (t?.linescores?.length) return t.linescores.map((l) => l.value).join(' ')
  return ''
}

function competitionsOf(e) {
  if (e.competitions?.length) return e.competitions
  const out = []
  for (const g of e.groupings || []) {
    for (const c of g.competitions || []) out.push(c)
  }
  return out
}

function mapEspnEvent(e, sport, league, comps) {
  const teams = comps.competitors || []
  const home = teams.find((t) => t.homeAway === 'home') || teams[0]
  const away = teams.find((t) => t.homeAway === 'away') || teams[1]
  const st = (comps.status || e.status || {}).type || {}
  let status = 'pre'
  if (st.state === 'in' || st.description === 'In Progress') status = 'in'
  if (st.state === 'post' || st.completed) status = 'post'
  const a = teamName(away)
  const b = teamName(home)
  if (!a || !b) return null
  const scoreA = scoreOf(away)
  const scoreB = scoreOf(home)
  let winner = null
  if (away?.winner) winner = a
  if (home?.winner) winner = b
  const sa = Number(scoreA)
  const sb = Number(scoreB)
  if (status === 'post' && !winner && scoreA !== '' && scoreB !== '' && Number.isFinite(sa) && Number.isFinite(sb) && sa !== sb) {
    winner = sa > sb ? a : b
  }
  const note = (comps.notes || []).map((n) => n.text).filter(Boolean)[0]
  const clock = note || st.shortDetail || st.detail || st.description || ''
  return {
    id: String(comps.id || e.id),
    sport,
    league: comps.notes ? (e.shortName || league) : league,
    a,
    b,
    scoreA,
    scoreB,
    status,
    clock,
    winner,
    void: status === 'post' && !winner,
    logoA: away?.team?.logo || away?.athlete?.flag?.href || away?.logo || '',
    logoB: home?.team?.logo || home?.athlete?.flag?.href || home?.logo || '',
    start: comps.date || e.date || ''
  }
}

function mapCricketEvent(e, league) {
  const teams = e.competitors || []
  const home = teams.find((t) => t.homeAway === 'home') || teams[0]
  const away = teams.find((t) => t.homeAway === 'away') || teams[1]
  const a = teamName(away)
  const b = teamName(home)
  if (!a || !b || a === 'TBA' || b === 'TBA') return null
  let status = 'pre'
  if (e.status === 'in') status = 'in'
  if (e.status === 'post') status = 'post'
  let winner = null
  if (away?.winner) winner = a
  if (home?.winner) winner = b
  const abandoned = /abandon|no result|cancel/i.test(String(e.description || e.title || ''))
  return {
    id: 'cric-' + String(e.id || e.competitionId),
    sport: 'cricket',
    league,
    a,
    b,
    scoreA: String(away?.score || ''),
    scoreB: String(home?.score || ''),
    status,
    clock: e.summary || e.description || e.title || e.status || '',
    winner,
    void: status === 'post' && (abandoned || !winner),
    logoA: away?.logo || '',
    logoB: home?.logo || '',
    start: e.date || ''
  }
}

async function refresh() {
  const out = []
  const jobs = SOURCES.map(async (src) => {
    try {
      const d = await grab(src.url)
      for (const e of d.events || []) {
        const comps = competitionsOf(e)
        if (!comps.length) continue
        for (const c of comps) {
          const m = mapEspnEvent(e, src.sport, src.league, c)
          if (m) out.push(m)
        }
      }
    } catch (err) {
      console.log('src fail', src.league, err.message)
    }
  })
  jobs.push((async () => {
    try {
      const d = await grab('https://site.web.api.espn.com/apis/v2/scoreboard/header?sport=cricket')
      for (const sport of d.sports || []) {
        for (const lg of sport.leagues || []) {
          for (const e of lg.events || []) {
            const m = mapCricketEvent(e, lg.shortName || lg.name || 'Cricket')
            if (m) out.push(m)
          }
        }
      }
    } catch (err) {
      console.log('cricket fail', err.message)
    }
  })())
  await Promise.all(jobs)
  const limited = []
  const tennisPre = []
  const tennisPost = []
  for (const m of out) {
    if (m.sport !== 'tennis') { limited.push(m); continue }
    if (m.status === 'in') limited.push(m)
    else if (m.status === 'pre') tennisPre.push(m)
    else tennisPost.push(m)
  }
  limited.push(...tennisPre.slice(0, 12), ...tennisPost.slice(0, 8))
  const rank = { in: 0, pre: 1, post: 2 }
  limited.sort((x, y) => (rank[x.status] - rank[y.status]) || String(x.start).localeCompare(String(y.start)))
  cache = { matches: limited, updated: Date.now() }
  console.log('live matches', limited.length, 'in', limited.filter((m) => m.status === 'in').length)
}

refresh().catch((e) => console.log(e))
setInterval(() => refresh().catch((e) => console.log(e)), 20000)

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  if (req.url.startsWith('/api/live') || req.url === '/live') {
    res.end(JSON.stringify({ ok: true, ...cache }))
    return
  }
  if (req.url === '/health' || req.url === '/api/health') {
    res.end(JSON.stringify({ ok: true, count: cache.matches.length, updated: cache.updated }))
    return
  }
  res.statusCode = 404
  res.end(JSON.stringify({ ok: false }))
})

server.listen(PORT, '0.0.0.0', () => console.log('live api on', PORT))
