import React, { useState } from 'react'
import { inr, useStore } from '../store.jsx'

export default function Wallet({ onAuth }) {
  const { user, deposit, withdraw, notify } = useStore()
  const [tab, setTab] = useState('deposit')
  const [amount, setAmount] = useState(500)
  const [method, setMethod] = useState('UPI')

  if (!user) {
    return (
      <div className="page">
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h3>Wallet</h3>
          <p style={{ color: '#9aa6b8', margin: '10px 0 16px' }}>Login to deposit, withdraw and view history.</p>
          <button className="btn btn-gold" onClick={onAuth}>Login / Sign Up</button>
        </div>
      </div>
    )
  }

  function go() {
    const fn = tab === 'deposit' ? deposit : withdraw
    const r = fn(amount, method)
    if (!r.ok) notify(r.error)
  }

  return (
    <div className="page">
      <div className="grid g-3" style={{ marginBottom: 16 }}>
        <div className="stat"><small>Balance</small><b>{inr(user.balance)}</b></div>
        <div className="stat"><small>Deposited</small><b>{inr(user.deposited)}</b></div>
        <div className="stat"><small>Wagered</small><b>{inr(user.wagered)}</b></div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div className="tabs">
          <button className={'tab' + (tab === 'deposit' ? ' on' : '')} onClick={() => setTab('deposit')}>Deposit</button>
          <button className={'tab' + (tab === 'withdraw' ? ' on' : '')} onClick={() => setTab('withdraw')}>Withdraw</button>
        </div>
        <div className="field"><label>Amount</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
        <div className="chip-row" style={{ marginBottom: 12 }}>
          {(tab === 'deposit' ? [500, 1000, 2000, 5000] : [1000, 2000, 5000, 10000]).map((n) => (
            <button key={n} className={'chip' + (Number(amount) === n ? ' on' : '')} onClick={() => setAmount(n)}>{n}</button>
          ))}
        </div>
        <div className="field">
          <label>Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>UPI</option><option>PhonePe</option><option>Google Pay</option><option>Paytm</option><option>Bank Transfer</option>
          </select>
        </div>
        <button className="btn btn-gold" onClick={go}>{tab === 'deposit' ? 'Pay Now' : 'Request Withdrawal'}</button>
        <p style={{ color: '#9aa6b8', marginTop: 10, fontSize: 12 }}>Min deposit ₹500 • Min withdrawal ₹1000 • Demo credits only.</p>
      </div>
      <div className="card" style={{ marginTop: 16, overflow: 'auto' }}>
        <table className="table">
          <thead><tr><th>Time</th><th>Type</th><th>Note</th><th>Amount</th></tr></thead>
          <tbody>
            {user.tx.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.at).toLocaleString()}</td>
                <td>{t.type}</td>
                <td>{t.note}</td>
                <td>{inr(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
