function ProjectDashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to your project dashboard. Here you can manage your WhatsApp automation settings.</p>

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
