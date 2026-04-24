import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden text-slate-900 font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-7xl px-8 py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
