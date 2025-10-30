import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import io from 'socket.io-client'
import api from '../utils/api'

function WhatsAppConnect() {
  const [connecting, setConnecting] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [status, setStatus] = useState('disconnected')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    checkConnectionStatus()
  }, [id])

  const checkConnectionStatus = async () => {
    try {
      const response = await api.get(`/whatsapp/projects/${id}/status`)
      if (response.data.connected) {
        setStatus('connected')
        navigate(`/project/${id}`)
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    setStatus('connecting')
    try {
      // Connect to Socket.IO with credentials to send cookies
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true
      })

      // Join project room
      socket.emit('join_project', id)

      // Listen for QR ready event
      socket.on('qr_ready', (data) => {
        setQrCode(data.qrCode)
        setStatus('qr_ready')
      })

      // Listen for connected event
      socket.on('connected', () => {
        setStatus('connected')
        navigate(`/project/${id}`)
        socket.disconnect()
      })

      // Handle connection errors
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setStatus('disconnected')
        toast.error('Connection failed')
        socket.disconnect()
      })

      // Handle WhatsApp initialization errors (e.g., number already connected)
      socket.on('error', (errorMessage) => {
        console.error('WhatsApp error:', errorMessage)
        setStatus('disconnected')
        toast.error(errorMessage)
        socket.disconnect()
      })

      // Initialize WhatsApp connection
      await api.post(`/whatsapp/projects/${id}/initialize`)

    } catch (error) {
      console.error('Error initializing WhatsApp:', error)
      toast.error('Failed to initialize WhatsApp')
      setStatus('disconnected')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Connect WhatsApp
        </h1>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            {status === 'connecting' && 'Initializing WhatsApp connection...'}
            {status === 'qr_ready' && 'Scan the QR code below with WhatsApp on your phone.'}
            {status === 'connected' && 'WhatsApp connected successfully!'}
            {status === 'disconnected' && 'Connect your WhatsApp account to start sending and receiving messages through this project.'}
          </p>
          {qrCode && status === 'qr_ready' && (
            <div className="mb-6">
              <img src={qrCode} alt="WhatsApp QR Code" className="mx-auto border rounded-lg shadow-md" />
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppConnect
