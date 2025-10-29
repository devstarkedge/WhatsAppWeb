import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    if (name === 'email') {
      if (!value) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Email is invalid'
      else delete newErrors.email
    } else if (name === 'password') {
      if (!value) newErrors.password = 'Password is required'
      else delete newErrors.password
    }
    setErrors(newErrors)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (!value) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    } else {
      validateField(name, value)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await api.post('/auth/login', formData)
        if (response.status === 200) {
          login(response.data.user)
          navigate('/dashboard')
        } else {
          toast.error(response.data.message || 'Login failed')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error(error.response?.data?.message || 'An error occurred during login')
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-cyan-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-br from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="relative z-10 bg-linear-to-br from-white/95 via-blue-50/50 to-purple-50/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-400 to-purple-400 rounded-2xl"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-center mb-8 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-3" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                placeholder="Enter your email"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-4">{errors.email || ''}</p>
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-3" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                placeholder="Enter your password"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-4">{errors.password || ''}</p>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
              </button>
            </div>
            <div className="mt-6 text-center ">
        <Link
          to="/register"
          className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200"
        >
          Need an account? Register
        </Link>
      </div>
          </form>
        </div>
      </div>
      
    </div>
  )
}

export default Login
