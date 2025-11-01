import { useEffect, useState } from 'react'
import { BACKEND_URL, getToken } from '../config'
import { Link } from 'react-router-dom'

interface ApplicationItem {
  id: string
  job: {
    id: string
    title: string
    description: string
    companyid: string
    company: { id: string; name: string; logo?: string | null }
  }
  coverletter?: string | null
  created: string
  relevancescore?: number | null
  videolink?: string | null
}

export const Applications = function () {
  const [items, setItems] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${BACKEND_URL}/application/user`, {
          headers: { Authorization: getToken() || '' }
        })
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My Applications</h1>
        <div className="border rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
          <table className="w-full">
            <thead style={{backgroundColor: '#2a2a2a'}}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Job</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Applied</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}>
                  <td className="px-4 py-3">
                    <Link to={`/job/${item.job.id}`} className="hover:underline font-medium" style={{color: '#ea580c'}}>
                      {item.job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.job.company?.logo && (
                        <img src={item.job.company.logo} alt={item.job.company.name} className="w-6 h-6 rounded" />
                      )}
                      <span className="text-white">{item.job.company?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(item.created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const s = item.relevancescore as unknown as string | number | null | undefined
                      const scoreNum = s === null || s === undefined || s === '' ? NaN : Number(s)
                      return isNaN(scoreNum) ? (
                        <span className="text-gray-500 text-sm">—</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{backgroundColor: scoreNum >= 8 ? '#22c55e33' : scoreNum >= 6 ? '#eab30833' : '#ef444433', color: scoreNum >= 8 ? '#22c55e' : scoreNum >= 6 ? '#eab308' : '#ef4444'}}>
                          {scoreNum}/10
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/application/${item.id}`} className="px-3 py-2 rounded-md text-sm" style={{backgroundColor: '#ea580c', color: 'white', textDecoration: 'none'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                      >View</Link>
                      {item.videolink && (
                        <a href={item.videolink} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md text-sm" style={{backgroundColor: '#22c55e', color: 'white', textDecoration: 'none'}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                        >Video</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">You haven't applied to any jobs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
