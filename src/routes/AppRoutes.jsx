import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import AIHomework from '../pages/AIHomework'
import Notes from '../pages/Notes'
import Quiz from '../pages/Quiz'
import Flashcards from '../pages/Flashcards'
import Pomodoro from '../pages/Pomodoro'
import Goals from '../pages/Goals'
import Notifications from '../pages/Notifications'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'
import Login from '../pages/Login'
import Register from '../pages/Register'
import GcashPay from '../pages/GcashPay'
import NotFound from '../pages/NotFound'
import ProtectedLayout from '../components/layout/ProtectedLayout'
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/gcash-pay" element={<GcashPay />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIHomework />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  )
}

export default AppRoutes
