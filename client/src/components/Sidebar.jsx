import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  
  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <>
     <aside className="fixed left-0 top-0 h-full w-20 bg-white/90 backdrop-blur-md border-r border-white/20 shadow-lg z-40 flex flex-col py-4">
       

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-4 flex-1">
           
        <button
          onClick={handleBackToDashboard}
          className="flex flex-col items-center p-0 rounded-lg  transition-colors duration-200"
          title="Back to User Dashboard"
        >
           <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
        </button>
          {/* Chat */}
          <button className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200" title="Chat">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs text-gray-600 mt-1">Chat</span>
          </button>

          {/* Agents */}
          <button className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200" title="Agents">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-600 mt-1">Agents</span>
          </button>

          {/* Contacts */}
          <button className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200" title="Contacts">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-xs text-gray-600 mt-1">Contacts</span>
          </button>

          {/* Settings */}
          <button className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200" title="Settings">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-600 mt-1">Settings</span>
          </button>
        </nav>

        {/* Profile */}
        <button
          onClick={() => navigate('profile')}
          className="flex flex-col items-center p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          title="Profile"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs text-gray-600 mt-1">Profile</span>
        </button>
      </aside>
    </>
  )
}

export default Sidebar
