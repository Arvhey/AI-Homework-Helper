import React from 'react'
import AppRoutes from './routes/AppRoutes'
import './styles/glass.css'
import './styles/animations.css'

function App() {
  return (
    <div className="min-h-screen">
      <div className="bg-mesh" />
      <AppRoutes />
    </div>
  )
}

export default App
