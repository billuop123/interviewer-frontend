import React from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  roleId: string
  companyId: string
  created: string
}

interface Role {
  id: string
  name: string
}

interface UsersTabProps {
  users: User[]
  roles: Role[]
  page: number
  onPageChange: (page: number) => void
  onRoleUpdate: (userId: string, roleId: string) => void
  onDelete: (userId: string) => void
  pendingRoles: Record<string, string>
  onPendingRoleChange: (userId: string, roleId: string) => void
}

export const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  roles, 
  page, 
  onPageChange, 
  onRoleUpdate, 
  onDelete,
  pendingRoles,
  onPendingRoleChange
}) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'joined', label: 'Joined' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Actions' }
  ]

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Users Management</h2>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="px-3 py-1 rounded-md font-medium disabled:opacity-50"
            style={{backgroundColor: '#2a2a2a', color: page === 1 ? '#6b7280' : 'white'}}
          >
            Prev
          </button>
          <span className="text-gray-400">Page {page}</span>
          <button 
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 rounded-md font-medium text-white"
            style={{backgroundColor: '#2a2a2a'}}
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="border rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
        <table className="w-full">
          <thead style={{backgroundColor: '#2a2a2a'}}>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user.id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}
              >
                <td className="px-4 py-3 text-white">{user.name}</td>
                <td className="px-4 py-3 text-gray-300">{user.email}</td>
                <td className="px-4 py-3 text-gray-300">{user.phone || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-300">{user.companyId ? 'Associated' : 'Independent'}</td>
                <td className="px-4 py-3 text-gray-300">{new Date(user.created).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={pendingRoles[user.id] ?? user.roleId ?? ''}
                    onChange={(e) => onPendingRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 rounded-md border"
                    style={{backgroundColor: '#2a2a2a', borderColor: '#4b5563', color: 'white'}}
                  >
                    <option value="">Select role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onRoleUpdate(user.id, (pendingRoles[user.id] ?? user.roleId) || '')}
                      className="px-3 py-1 rounded-md text-sm font-medium text-white"
                      style={{backgroundColor: '#3b82f6'}}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => onDelete(user.id)}
                      className="px-3 py-1 rounded-md text-sm font-medium text-white"
                      style={{backgroundColor: '#ef4444'}}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


