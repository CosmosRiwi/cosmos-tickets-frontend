import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'
import Events from '../pages/Events'
import Seats from '../pages/Seats'
import Payment from '../pages/Payment'
import Confirmed from '../pages/Confirmed'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/pos" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/pos/eventos" element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        } />

        <Route path="/pos/seats/:eventId" element={
          <ProtectedRoute>
            <Seats />
          </ProtectedRoute>
        } />

        <Route path="/pos/payment" element={
          <ProtectedRoute>
            <Payment />
        </ProtectedRoute>
        } />

        <Route path="/pos/confirmed" element={
          <ProtectedRoute>
            <Confirmed />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

