import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react"

export const NotFound = function () {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-gray-200/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-300/15 to-gray-200/15 dark:from-gray-600/15 dark:to-gray-700/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-200/10 to-purple-200/10 dark:from-blue-800/10 dark:to-purple-800/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-full p-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full border border-gray-200/60 dark:border-gray-800/60 shadow-lg">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-gray-900 dark:text-white mb-4">
              404
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-100 dark:hover:to-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Browse Jobs</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Home className="w-5 h-5 text-green-500" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate('/my-companies')}
                className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <AlertCircle className="w-5 h-5 text-purple-500" />
                <span className="font-medium">My Companies</span>
              </button>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/60 dark:border-blue-800/60 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Need Help?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              If you believe this is an error, please contact our support team or try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
