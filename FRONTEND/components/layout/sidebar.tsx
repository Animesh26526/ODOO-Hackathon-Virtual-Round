"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Users, CheckSquare, Menu, X, BarChart3, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/equipment", label: "Equipment", icon: Package },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/requests/kanban", label: "Requests (Kanban)", icon: CheckSquare },
  { href: "/requests/calendar", label: "Requests (Calendar)", icon: BarChart3 },
]

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  technician: "Technician",
  "equipment-owner": "Equipment Owner",
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    const email = localStorage.getItem("userEmail") || ""
    setUserRole(role)
    setUserEmail(email)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split("")
      .slice(0, 2)
      .map((c) => c.toUpperCase())
      .join("")
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sidebar-foreground">
              <div className="w-7 h-7 bg-sidebar-primary rounded flex items-center justify-center text-xs font-bold">
                GG
              </div>
              <span className="text-lg">GearGuard</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User profile section */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
                {getInitials(userEmail)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userEmail || "User"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{roleLabels[userRole] || "Guest"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
