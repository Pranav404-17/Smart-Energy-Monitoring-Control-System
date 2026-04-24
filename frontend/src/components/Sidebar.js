import React, { useState, useEffect } from 'react'
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
import { getAlertStats } from '../services/api'

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
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAlertStats()
        setUnreadCount(data.unread || 0)
      } catch (error) {
        console.error('Failed to fetch alert stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Poll every 10 seconds
    
    window.addEventListener('alertsChanged', fetchStats)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('alertsChanged', fetchStats)
    }
  }, [])

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
              {item.name === 'Alerts' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

    </div>
  )
}
