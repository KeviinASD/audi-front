import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/routes/AppRouter'
import './styles/globals.css'
import { Toaster } from 'sonner'

function App() {

  return (
    <BrowserRouter>
      <Toaster />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
