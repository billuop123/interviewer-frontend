import React from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column[]
  data: T[]
  keyExtractor: (row: T) => string
}

export function DataTable<T extends Record<string, any>>({ columns, data, keyExtractor }: DataTableProps<T>) {
  return (
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
          {data.map((row, index) => (
            <tr 
              key={keyExtractor(row)} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{borderTopColor: '#374151', borderTop: index > 0 ? '1px solid' : 'none'}}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-300">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

