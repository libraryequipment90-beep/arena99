import { img } from './data.js'

const sportImg = {
  cricket: img.cricket,
  football: img.football,
  basketball: img.basketball,
  tennis: img.tennis,
  kabaddi: img.kabaddi
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
