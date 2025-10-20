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
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 overflow-auto">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Applications</h1>
        <div className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Job</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Company</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Applied</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <Link to={`/job/${item.job.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {item.job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.job.company?.logo && (
                        <img src={item.job.company.logo} alt={item.job.company.name} className="w-6 h-6 rounded" />
                      )}
                      <span className="text-gray-900 dark:text-white">{item.job.company?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {new Date(item.created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const s = item.relevancescore as unknown as string | number | null | undefined
                      const scoreNum = s === null || s === undefined || s === '' ? NaN : Number(s)
                      return isNaN(scoreNum) ? (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">
                          {scoreNum}/10
                        </span>
                      )
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/application/${item.id}`} className="px-3 py-2 rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm">View</Link>
                      {item.videolink && (
                        <a href={item.videolink} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm">Video</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-700 dark:text-gray-300">You haven't applied to any jobs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
