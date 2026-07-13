import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import './nav.css'
import Nav from './Nav'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Nav />
  </StrictMode>,
)
