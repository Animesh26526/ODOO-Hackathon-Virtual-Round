"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wrench, Users, ClipboardList, Kanban, Calendar, Plus, ChevronDown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
}

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  badge?: string
  children?: NavItem[]
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Equipment",
      href: "/dashboard/equipment",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      label: "Teams",
      href: "/dashboard/teams",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Maintenance Requests",
      href: "/dashboard/requests",
      icon: <ClipboardList className="w-5 h-5" />,
      badge: "12",
    },
    {
      label: "Kanban",
      href: "/dashboard/kanban",
      icon: <Kanban className="w-5 h-5" />,
    },
    {
      label: "Calendar",
      href: "/dashboard/calendar",
      icon: <Calendar className="w-5 h-5" />,
    },
  ]

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* Logo section */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Zap className="w-6 h-6" />
        </div>
        {isOpen && (
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-sidebar-foreground">GearGuard</span>
            <span className="text-xs text-sidebar-foreground/60">Maintenance Pro</span>
          </div>
        )}
      </div>

      {/* Navigation section */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          const isExpanded = expandedItems.includes(item.label)

          return (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none rounded-full bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isExpanded && "bg-sidebar-accent/50",
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      <ChevronDown
                        className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}

        {/* Create Request - prominent button */}
        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <Link
            href="/dashboard/requests/create"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-medium",
              !isOpen && "justify-center",
            )}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm">Create Request</span>}
          </Link>
        </div>
      </nav>
    </aside>
  )
}
