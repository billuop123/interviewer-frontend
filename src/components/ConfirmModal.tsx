import React from "react"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, confirmText = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-md ${confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

