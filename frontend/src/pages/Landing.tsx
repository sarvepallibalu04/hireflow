import React from 'react'

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-primary-600">
          🌊 HireFlow
        </div>
        <div className="flex gap-6">
          <a href="#features" className="text-gray-600 hover:text-primary-600">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-primary-600">Pricing</a>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Land Your Dream Job Faster
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered resume optimization, interview coaching, and job matching
          </p>
          <button className="px-8 py-3 bg-primary-600 text-white text-lg rounded-lg hover:bg-primary-700">
            Start Free →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How HireFlow Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-3">Resume Optimizer</h3>
              <p className="text-gray-600">
                Get ATS-friendly resumes with AI-powered keyword optimization
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-2xl font-bold mb-3">Interview Coach</h3>
              <p className="text-gray-600">
                Practice with AI and master the STAR methodology for success
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-3">Job Matcher</h3>
              <p className="text-gray-600">
                Find roles that match your skills from multiple job boards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-8 py-12 text-center">
        <p>© 2026 HireFlow. All rights reserved.</p>
      </footer>
    </div>
  )
}