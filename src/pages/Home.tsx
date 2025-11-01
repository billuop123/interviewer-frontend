import { Link } from "react-router-dom"
import { useUser } from "../contexts/userContext"
import { Briefcase, Users, Search, ArrowRight, CheckCircle, Zap, Shield, Target } from "lucide-react"
import { useEffect } from "react"

export const Home = function() {
  const { user } = useUser()
  const params = new URLSearchParams(window.location.search)
  console.log(params.get('token'))
  useEffect(() => {
    if (params.get('token')) {
      sessionStorage.setItem('auth_token', params.get('token') || '')
    }
  }, [user])
  return (
    <>
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        .landing-page {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `}</style>
      <div className="h-screen w-screen bg-gray-900 overflow-hidden no-scrollbar landing-page">
      {/* Hero Section */}
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-400/10 to-transparent"></div>
        
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="text-center space-y-8 max-w-6xl mx-auto w-full px-4">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight">
                Find Your
                <span className="block" style={{color: '#ea580c'}}>
                  Dream Job
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Connect with innovative companies and discover opportunities that align perfectly with your skills and career aspirations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {user.userId ? (
                <>
                  <Link
                    to="/jobs"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border" style={{backgroundColor: '#ea580c', borderColor: '#4b5563', color: 'white', textDecoration: 'none'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                  >
                    <Search size={20} />
                    Browse All Jobs
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-500 rounded-full font-bold text-lg hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    style={{color: 'white', textDecoration: 'none'}}
                  >
                    <Users size={20} />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center gap-3 px-10 py-4 bg-orange-500 rounded-full font-bold text-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-gray-600"
                    style={{color: 'white', textDecoration: 'none'}}
                  >
                    Get Started
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/signin"
                    className="group relative inline-flex items-center gap-3 px-10 py-4 border-2 border-gray-500 rounded-full font-bold text-lg hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    style={{color: 'white', textDecoration: 'none'}}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}