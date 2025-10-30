import { useState, useEffect } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import Sidebar from './Sidebar'
import io from 'socket.io-client'

function ProjectLayout() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [whatsappStatus, setWhatsappStatus] = useState('Disconnected')
  const [connecting, setConnecting] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchProject()
    checkWhatsAppStatus()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      setProject(response.data)
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project')
      if (error.response?.status === 401) {
        navigate('/login')
      } else if (error.response?.status === 404) {
        toast.error('Project not found')
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const checkWhatsAppStatus = async () => {
    try {
      const response = await api.get(`/whatsapp/projects/${id}/status`)
      setWhatsappStatus(response.data.connected ? 'Connected' : 'Disconnected')
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
      setWhatsappStatus('Disconnected')
    }
  }

  // Listen for WhatsApp connection status changes
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true
    })

    socket.on('connect', () => {
      socket.emit('join_project', id)
    })

    socket.on('qr_ready', () => {
      setWhatsappStatus('Connecting')
      setConnecting(true)
    })

    socket.on('connected', () => {
      setWhatsappStatus('Connected')
      setConnecting(false)
    })

    socket.on('connect_error', () => {
      setWhatsappStatus('Disconnected')
      setConnecting(false)
    })

    // Handle WhatsApp initialization errors (e.g., number already connected)
    socket.on('error', (errorMessage) => {
      console.error('WhatsApp error:', errorMessage)
      setWhatsappStatus('Disconnected')
      setConnecting(false)
      toast.error(errorMessage)
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  const handleDisconnectWhatsApp = async () => {
    try {
      await api.delete(`/whatsapp/projects/${id}/disconnect`)
      toast.success('WhatsApp disconnected successfully')
      setWhatsappStatus('Disconnected')
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error)
      toast.error('Failed to disconnect WhatsApp')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Project not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50 flex">
      <Sidebar />

      {/* Navigation Bar */}
      <div className="flex-1 ml-20">
        <nav className="fixed top-0 left-20 right-0 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
          <div className="px-6 py-4 flex justify-between items-center">
            <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {project.name}
            </span>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${whatsappStatus === 'Connected' ? 'bg-green-500' : whatsappStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                WhatsApp: {whatsappStatus}
              </span>
              {whatsappStatus === 'Disconnected' && (
                <button
                  onClick={() => navigate(`/project/${id}/whatsapp-connect`)}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Connect WhatsApp
                </button>
              )}
              {whatsappStatus === 'Connected' && (
                <button
                  onClick={handleDisconnectWhatsApp}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disconnect WhatsApp
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative px-4 py-8 pt-30">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ProjectLayout
