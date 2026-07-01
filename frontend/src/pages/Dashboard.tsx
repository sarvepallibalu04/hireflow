import React, { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { getToken } from '../services/api'

export const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState('User')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = getToken()
    if (!token) {
      window.location.href = '/login'
      return
    }

    // In real app, decode JWT to get user info
    // For now, get from localStorage or session
    const userStr = localStorage.getItem('userName')
    if (userStr) {
      setUserName(userStr)
    }

    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Let's optimize your job search and land your dream role.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resume Optimizer */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-xl font-bold mb-2">Resume Optimizer</h2>
            <p className="text-gray-600 mb-4">
              Upload your resume and get AI-powered optimization tips
            </p>
            <button className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
              Upload Resume
            </button>
          </div>

          {/* Interview Coach */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎤</div>
            <h2 className="text-xl font-bold mb-2">Interview Coach</h2>
            <p className="text-gray-600 mb-4">
              Practice with AI and master the STAR methodology
            </p>
            <button className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
              Start Practice
            </button>
          </div>

          {/* Job Matcher */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2">Job Matcher</h2>
            <p className="text-gray-600 mb-4">
              Find roles that match your skills from multiple job boards
            </p>
            <button className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
              Find Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}