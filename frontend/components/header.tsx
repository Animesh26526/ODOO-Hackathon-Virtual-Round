"use client"

import { Menu, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          {/* Menu toggle */}
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:flex" aria-label="Toggle sidebar">
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumb or title area */}
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              3
            </span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User menu */}
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
