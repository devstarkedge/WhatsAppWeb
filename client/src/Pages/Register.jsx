import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' })
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
    if (name === 'email') {
      if (!value) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Email is invalid'
      else delete newErrors.email
    } else if (name === 'password') {
      if (!value) newErrors.password = 'Password is required'
      else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters'
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
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Register submitted:', formData)
      // Here you would typically send the data to your backend
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Join Us
        </h1>
        <form onSubmit={handleSubmit}>
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
          <div className="mb-4">
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
          <div className="mb-6">
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
