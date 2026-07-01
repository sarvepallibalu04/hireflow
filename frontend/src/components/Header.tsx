import React from 'react'
import { authService } from '../services/api'

interface HeaderProps {
  userName: string
}

export const Header: React.FC<HeaderProps> = ({ userName }) => {
  const handleLogout = () => {
    authService.logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">🌊 HireFlow</div>
        <div className="flex items-center gap-6">
          <span className="text-gray-300">Welcome, {userName}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}