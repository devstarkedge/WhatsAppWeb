import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'

function ProjectDashboard() {
  const [messages, setMessages] = useState([])
  const { id: projectId } = useParams()

  useEffect(() => {
    // Connect to Socket.IO
    const socket = io('http://localhost:5000', {
      withCredentials: true
    })

    // Join project room
    socket.emit('join_project', projectId)

    // Listen for messages
    socket.on('message', (message) => {
      setMessages(prev => [...prev, message])
    })

    // Listen for disconnection events
    socket.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason)
      // Optionally, update UI to show disconnected state
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [projectId])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to your project dashboard. Here you can manage your WhatsApp automation settings.</p>

        {/* Messages Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Received Messages</h2>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages received yet.</p>
            ) : (
              <ul className="space-y-2">
                {messages.map((msg, index) => (
                  <li key={msg.id || index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">From: {msg.from}</p>
                        <p className="text-gray-700">{msg.body}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Placeholder content for project dashboard */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-white/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Overview</h3>
            <p className="text-gray-600">This is where you can manage your WhatsApp automation settings, configure bots, and monitor conversations.</p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-white/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">WhatsApp Integration</h3>
            <p className="text-gray-600">Connect your WhatsApp account and start building automated responses and workflows.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDashboard
