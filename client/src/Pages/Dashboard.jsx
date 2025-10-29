import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchProjects()
  }, [])



  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      const response = await api.post('/projects', formData)
      setProjects([response.data, ...projects])
      setFormData({ name: '', description: '' })
      setShowCreateForm(false)
      toast.success('Project created successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(projects.filter(project => project._id !== projectId))
      toast.success('Project deleted successfully!')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      logout()
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WhatsApp Projects
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium">{user?.name || 'User'}</span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative container mx-auto px-4 py-8 pt-30">
        {/* Welcome Section */}
        <div className="mb-1 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left Column - Welcome Content */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-pulse">
                    Welcome back, {user?.name || 'User'}! 
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">Ready to automate your WhatsApp?</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-lg">
                Build powerful WhatsApp bots and automation with whatsapp-web.js - manage conversations, send messages, and create interactive experiences that scale.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">∞</div>
                      <div className="text-xs text-gray-600">Automation Power</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">24/7</div>
                      <div className="text-xs text-gray-600">Always Online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & CTA */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md border border-white/50 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{projects.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Active Projects</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md border border-white/50 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">∞</div>
                  <div className="text-sm text-gray-600 font-medium">Messages Ready</div>
                </div>
              </div>

              <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-white/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Quick Start</h3>
                <p className="text-gray-700 text-sm mb-4">Create your first WhatsApp automation project in seconds</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={projects.length >= 5}
                  className="w-full cursor-pointer bg-linear-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-xl hover:shadow-2xl text-base"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {projects.length >= 5 ? '🚫 Max Projects Reached' : '✨ Create New Project'}
                </button>
              </div>

            
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
            <h2 className="text-2xl font-bold px-4 bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Recent Projects
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-linear-to-br from-blue-100 to-purple-100 rounded-full mb-2">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <p className="text-gray-400 mb-6">Start building your first WhatsApp Business project</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className="bg-white/80 backdrop-blur-sm flex flex-col justify-between p-6 rounded-xl shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{project.name}</h3>
                      {project.description && (
                        <p className="text-gray-600 mb-3 leading-relaxed text-sm">{project.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Created: {new Date(project.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100"
                      title="Delete Project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* View Project Button */}
                  <button
                    className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group-hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Project</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>



        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-linear-to-br from-white/95 via-blue-50/50 to-purple-50/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-400 to-purple-400 rounded-2xl"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-center mb-8 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Project
                </h2>
                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-semibold mb-3" htmlFor="name">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-semibold mb-3" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm resize-none shadow-sm hover:shadow-md"
                      placeholder="Enter project description (optional)"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setFormData({ name: '', description: '' })
                      }}
                      className="flex-1 bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button for Create Project */}
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={projects.length >= 5}
          className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full shadow-2xl hover:shadow-3xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110 disabled:transform-none z-40 flex items-center justify-center group"
          title={projects.length >= 5 ? 'Max Projects Reached' : 'Create New Project'}
        >
          <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Dashboard
