import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter} from 'react-router-dom'
import Rutas from '../Routes/Rutas'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Rutas/>
    </BrowserRouter>
  </StrictMode>,
)
