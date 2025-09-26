import {type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../contexts/userContext'
import toast from 'react-hot-toast'

interface AuthGuardProps {
  children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useUser()

  // Show loading spinner while UserContext is validating the token
  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Only redirect if loading is complete AND user is not authenticated
  if (!loading && !user.userId) {
    toast.error('Please sign in to access this page')
    return <Navigate to="/signin" replace />
  }

  // If loading is complete and user is authenticated, show the protected content
  if (!loading && user.userId) {
    return <>{children}</>
  }

  // This should never be reached, but just in case
  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  )
}
