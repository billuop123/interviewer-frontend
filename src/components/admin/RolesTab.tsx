import React from 'react'

interface Role {
  id: string
  name: string
  code: string
}

interface RolesTabProps {
  roles: Role[]
}

export const RolesTab: React.FC<RolesTabProps> = ({ roles }) => {
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold text-white">Roles</h2>
      <div className="border rounded-xl overflow-hidden" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
        <table className="w-full">
          <thead style={{backgroundColor: '#2a2a2a'}}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Code</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, index) => (
              <tr 
                key={role.id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}
              >
                <td className="px-4 py-3 text-white">{role.name}</td>
                <td className="px-4 py-3 text-gray-300">{role.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


