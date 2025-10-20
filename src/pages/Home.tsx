import { Link } from "react-router-dom"
import { useUser } from "../contexts/userContext"
import { Briefcase, Building2, Users, Search, ArrowRight, CheckCircle, Zap, Shield, Target } from "lucide-react"

export const Home = function() {
  const { user } = useUser()

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
      <div className="h-screen w-screen bg-white dark:bg-black overflow-hidden no-scrollbar landing-page">
      {/* Hero Section */}
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-gray-100/20 to-transparent dark:from-transparent dark:via-gray-800/20 dark:to-transparent"></div>
        
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="text-center space-y-8 max-w-6xl mx-auto w-full px-4">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tight">
                Find Your
                <span className="block bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white bg-clip-text text-transparent">
                  Dream Job
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Connect with innovative companies and discover opportunities that align perfectly with your skills and career aspirations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              {user.userId ? (
                <>
                  <Link
                    to="/jobs"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Search size={20} />
                    Browse All Jobs
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-black dark:border-white text-black dark:text-white rounded-full font-bold text-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Users size={20} />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group relative inline-flex items-center gap-3 px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get Started
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/signin"
                    className="group relative inline-flex items-center gap-3 px-10 py-4 border-2 border-black dark:border-white text-black dark:text-white rounded-full font-bold text-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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