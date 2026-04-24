import React from 'react'
import { Search, Bell, DownloadCloud } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-8">
      {/* Search Bar */}
      <div className="flex w-full max-w-sm items-center relative">
        <Search className="absolute left-2.5 h-4 w-4 text-slate-400" />
        <Input 
          type="text" 
          placeholder="Search devices or metrics..." 
          className="pl-9 bg-slate-50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-slate-300 w-full"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Date / Month Filter Context */}
        <div className="hidden md:flex items-center gap-2 border-r pr-4 border-slate-200">
          <span className="text-sm text-slate-500 font-medium">Apr 24, 2026</span>
        </div>
      </div>
    </header>
  )
}
