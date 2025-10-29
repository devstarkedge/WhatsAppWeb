import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

import ProjectLayout from './components/ProjectLayout'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import ProjectDashboard from './Pages/ProjectDashboard.jsx'
import Profile from './pages/Profile.jsx'
import WhatsAppConnect from './pages/WhatsAppConnect.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <ProjectLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProjectDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="whatsapp-connect" element={<WhatsAppConnect />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}


export default App
