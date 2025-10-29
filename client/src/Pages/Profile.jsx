import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Extract firstName and lastName from user.name
  const firstName = user?.name?.split(' ')[0] || ''
  const lastName = user?.name?.split(' ').slice(1).join(' ') || ''

  console.log(user)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Error logging out:', error)
      logout()
      navigate('/login')
    }
  }


  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {firstName} {lastName}
          </h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">First Name</h3>
              <p className="text-gray-700">{firstName || 'N/A'}</p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-white/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Last Name</h3>
              <p className="text-gray-700">{lastName || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-white/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Email</h3>
            <p className="text-gray-700">{user?.email}</p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
