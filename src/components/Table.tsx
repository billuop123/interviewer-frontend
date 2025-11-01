import React from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps<T> {
  columns: Column[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
}

export function Table<T extends Record<string, any>>({ 
  columns, 
  data, 
  keyExtractor,
  onRowClick 
}: TableProps<T>) {
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
              onClick={() => onRowClick?.(row)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              style={{
                borderTopColor: '#374151', 
                borderTop: index > 0 ? '1px solid' : 'none',
                cursor: onRowClick ? 'pointer' : 'default'
              }}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-300">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] || '')}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

