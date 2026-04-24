import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart, 
  Bell, 
  Settings, 
  Zap,
  Activity
} from 'lucide-react'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Devices', href: '/devices', icon: Cpu },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Automation', href: '/automation', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-[260px] flex-col border-r bg-white px-4 py-8">
      {/* Brand logo */}
      <div className="flex items-center gap-3 px-2 mb-10 w-full">
        <img src="/logo.png" alt="Smart Energy Logo" className="h-14 w-14 object-contain" />
        <span className="text-lg font-bold text-slate-900 leading-tight tracking-tight">Smart Energy Monitor</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* User profile section */}
      <div className="mt-auto border-t pt-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600 text-sm ring-1 ring-slate-900/5">
            US
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">User Profile</span>
          </div>
        </div>
      </div>
    </div>
  )
}
