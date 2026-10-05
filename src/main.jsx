import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { LiveProvider } from './live.jsx'
import './index.css'

class Boundary extends React.Component {
  constructor(p) {
    super(p)
    this.state = { err: null }
  }
  static getDerivedStateFromError(err) {
    return { err }
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24, color: '#fff', background: '#0b0e14', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <p>{String(this.state.err)}</p>
          <button onClick={() => location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <StoreProvider>
        <LiveProvider>
          <Boundary>
            <App />
          </Boundary>
        </LiveProvider>
      </StoreProvider>
    </HashRouter>
  </React.StrictMode>
)
