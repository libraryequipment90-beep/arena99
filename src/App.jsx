import React, { useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { inr, useStore } from './store.jsx'
import Home from './pages/Home.jsx'
import Casino from './pages/Casino.jsx'
import Sports from './pages/Sports.jsx'
import Exchange from './pages/Exchange.jsx'
import Promotions from './pages/Promotions.jsx'
import Refer from './pages/Refer.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Wallet from './pages/Wallet.jsx'
import Profile from './pages/Profile.jsx'
import GamePage from './pages/GamePage.jsx'
import About from './pages/About.jsx'
import LiveCasino from './pages/LiveCasino.jsx'

export default function App() {
  const { user, logout, registerOrLogin, toast } = useStore()
  const [auth, setAuth] = useState(null)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const nav = useNavigate()

  function submitAuth(e) {
    e.preventDefault()
    setErr('')
    if (!sent) {
      if (phone.replace(/\D/g, '').slice(-10).length !== 10) {
        setErr('Enter a valid 10-digit number')
        return
      }
      setSent(true)
      return
    }
    if (otp !== '123456') {
      setErr('Demo OTP is 123456')
      return
    }
    const r = registerOrLogin(phone)
    if (!r.ok) setErr(r.error)
    else {
      setAuth(null)
      setSent(false)
      setOtp('')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="logo">
            <span className="logo-mark">A</span>
            Arena99
          </NavLink>
          <nav className="nav">
            <NavLink to="/sports">SPORTSBOOK</NavLink>
            <NavLink to="/exchange">EXCHANGE</NavLink>
            <NavLink to="/live">LIVE CASINO</NavLink>
            <NavLink to="/casino">CASINO</NavLink>
            <NavLink to="/refer">REFER & EARN</NavLink>
            <NavLink to="/promos">PROMOTIONS</NavLink>
            <NavLink to="/leaders">LEADERBOARDS</NavLink>
          </nav>
          <div className="top-actions">
            {user ? (
              <>
                <button className="wallet-chip" onClick={() => nav('/wallet')}>
                  Wallet <span>{inr(user.balance)}</span>
                </button>
                <button className="btn btn-gold" onClick={() => nav('/wallet')}>Deposit</button>
                <button className="btn btn-ghost" onClick={() => nav('/profile')}>{user.name}</button>
                <button className="btn btn-ghost" onClick={logout}>Out</button>
              </>
            ) : (
              <button className="btn btn-gold" onClick={() => setAuth('in')}>Login / Sign Up</button>
            )}
          </div>
        </div>
      </header>

      <div className="promo-strip">Grab ₹1,00,000 Welcome Bonus on 1st Deposit • Demo OTP 123456 • Play responsibly 18+</div>

      <main className="main">
        <Routes>
          <Route path="/" element={<Home onAuth={() => setAuth('in')} />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/live" element={<LiveCasino />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/promos" element={<Promotions />} />
          <Route path="/refer" element={<Refer />} />
          <Route path="/leaders" element={<Leaderboard />} />
          <Route path="/wallet" element={<Wallet onAuth={() => setAuth('in')} />} />
          <Route path="/profile" element={<Profile onAuth={() => setAuth('in')} />} />
          <Route path="/game/:id" element={<GamePage onAuth={() => setAuth('in')} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home onAuth={() => setAuth('in')} />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <h4>Arena99</h4>
            <p>A demo gaming playground inspired by modern Indian sportsbook + casino lobbies. All balances, odds and games are simulated for entertainment. No real-money wagering.</p>
            <div className="pay-row">
              {['UPI', 'PhonePe', 'GPay', 'Paytm', 'IMPS', 'Bank'].map((p) => <span className="pill" key={p}>{p}</span>)}
            </div>
            <div className="trust-row">
              {['18+', 'Secure', 'RNG Fair', 'Responsible'].map((p) => <span className="pill" key={p}>{p}</span>)}
            </div>
          </div>
          <div>
            <h4>Play</h4>
            <NavLink to="/sports">Sportsbook</NavLink>
            <NavLink to="/exchange">Exchange</NavLink>
            <NavLink to="/casino">Casino</NavLink>
            <NavLink to="/live">Live Casino</NavLink>
          </div>
          <div>
            <h4>Account</h4>
            <NavLink to="/wallet">Wallet</NavLink>
            <NavLink to="/promos">Promotions</NavLink>
            <NavLink to="/refer">Refer & Earn</NavLink>
            <NavLink to="/leaders">Leaderboards</NavLink>
          </div>
          <div>
            <h4>Company</h4>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/about">Responsible Gaming</NavLink>
            <NavLink to="/about">Terms</NavLink>
            <NavLink to="/about">Privacy</NavLink>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 22 }}>© Arena99 Demo. All rights reserved. Play for fun.</p>
      </footer>

      <nav className="mobile-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/casino">Casino</NavLink>
        <NavLink to="/sports">Sports</NavLink>
        <NavLink to="/promos">Promos</NavLink>
        <NavLink to="/wallet">Wallet</NavLink>
      </nav>

      {auth && (
        <div className="modal-bg" onClick={() => setAuth(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitAuth}>
            <h3>Login / Sign Up</h3>
            <p style={{ color: '#9aa6b8', fontSize: 13, marginBottom: 12 }}>Use any 10-digit number. Demo OTP is <b>123456</b>.</p>
            <div className="field">
              <label>Mobile number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" />
            </div>
            {sent && (
              <div className="field">
                <label>OTP</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              </div>
            )}
            {err && <p style={{ color: '#fca5a5', marginBottom: 10 }}>{err}</p>}
            <div className="row">
              <button className="btn btn-ghost grow" type="button" onClick={() => setAuth(null)}>Cancel</button>
              <button className="btn btn-gold grow" type="submit">{sent ? 'Verify & Login' : 'Send OTP'}</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
