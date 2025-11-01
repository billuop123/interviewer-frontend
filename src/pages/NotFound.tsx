import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react"

export const NotFound = function () {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-full p-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 backdrop-blur-sm rounded-full border shadow-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <AlertCircle className="w-16 h-16 text-gray-500" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold text-white mb-4">
              404
            </h1>
            <div className="w-24 h-1 mx-auto rounded-full" style={{background: 'linear-gradient(to right, #ea580c, #f97316)'}}></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" style={{backgroundColor: '#ea580c'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm border text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-300 mb-6">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-3 p-4 backdrop-blur-sm border rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#2a2a2a'
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#1a1a1a'
                }}
              >
                <Search className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Browse Jobs</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 p-4 backdrop-blur-sm border rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#2a2a2a'
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#1a1a1a'
                }}
              >
                <Home className="w-5 h-5 text-green-500" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => navigate('/my-companies')}
                className="flex items-center gap-3 p-4 backdrop-blur-sm border rounded-lg text-white transition-all duration-300 shadow-md hover:shadow-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#2a2a2a'
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLElement
                  target.style.backgroundColor = '#1a1a1a'
                }}
              >
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">My Companies</span>
              </button>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 p-6 backdrop-blur-sm border rounded-xl" style={{backgroundColor: '#ea580c10', borderColor: '#ea580c40'}}>
            <h4 className="text-sm font-semibold mb-2" style={{color: '#ea580c'}}>
              Need Help?
            </h4>
            <p className="text-sm text-gray-400">
              If you believe this is an error, please contact our support team or try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
