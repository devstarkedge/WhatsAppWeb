import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../utils/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'admin' })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    validateField(name, value)
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword)
    }
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    if (name === 'firstName') {
      if (!value) newErrors.firstName = 'First name is required'
      else if (value.length < 2) newErrors.firstName = 'First name must be at least 2 characters'
      else if (!/^[a-zA-Z\s]+$/.test(value)) newErrors.firstName = 'First name can only contain letters and spaces'
      else delete newErrors.firstName
    } else if (name === 'lastName') {
      if (value && value.length < 2) newErrors.lastName = 'Last name must be at least 2 characters'
      else if (value && !/^[a-zA-Z\s]+$/.test(value)) newErrors.lastName = 'Last name can only contain letters and spaces'
      else delete newErrors.lastName
    } else if (name === 'email') {
      if (!value) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Email is invalid'
      else delete newErrors.email
    } else if (name === 'password') {
      if (!value) newErrors.password = 'Password is required'
      else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters'
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      else delete newErrors.password
    } else if (name === 'confirmPassword') {
      if (!value) newErrors.confirmPassword = 'Confirm password is required'
      else if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match'
      else delete newErrors.confirmPassword
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
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters'
    else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) newErrors.firstName = 'First name can only contain letters and spaces'
    if (formData.lastName && formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters'
    else if (formData.lastName && !/^[a-zA-Z\s]+$/.test(formData.lastName)) newErrors.lastName = 'Last name can only contain letters and spaces'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await api.post('/auth/register', { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, role: formData.role })
        if (response.status === 201) {
          toast.success('Registration successful!')
          navigate('/login')
        } else {
          toast.error(response.data.message || 'Registration failed')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error(error.response?.data?.message || 'An error occurred during registration')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Join Us
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your first name"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-[16px]">{errors.firstName || ''}</p>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="lastName">
                Last Name (Optional)
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your last name"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-[16px]">{errors.lastName || ''}</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-xs italic mt-1 min-h-[16px]">{errors.email || ''}</p>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your password"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-[16px]">{errors.password || ''}</p>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Confirm your password"
              />
              <p className="text-red-500 text-xs italic mt-1 min-h-[16px]">{errors.confirmPassword || ''}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
