import React from 'react'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b mb-6" style={{borderColor: '#374151'}}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
            activeTab === tab.key 
              ? 'text-white border-b-2' 
              : 'text-gray-400 hover:text-white'
          }`}
          style={activeTab === tab.key ? { 
            backgroundColor: '#ea580c', 
            borderBottomColor: '#ea580c' 
          } : {}}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

