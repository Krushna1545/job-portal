import React from 'react'

export default function LoadingSpinner({ size = 'md', center = false }) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }
  
  if (center) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizes[size]}`}></div>
      </div>
    )
  }
  
  return <div className={`animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 ${sizes[size]}`}></div>
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
