"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { Clock, CheckCircle2, PackageOpen, Users, AlertCircle, Calendar, ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  technician: "Technician",
  "equipment-owner": "Equipment Owner",
}

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)
    setIsLoading(false)
  }, [])

  // Mock data
  const stats = [
    { label: "Total Equipment", value: "48", icon: PackageOpen, color: "text-blue-500" },
    { label: "Active Teams", value: "6", icon: Users, color: "text-green-500" },
    { label: "Pending Requests", value: "12", icon: Clock, color: "text-orange-500" },
    { label: "Completed (Month)", value: "34", icon: CheckCircle2, color: "text-emerald-500" },
  ]

  const recentRequests = [
    {
      id: 1,
      subject: "Leaking Oil",
      equipment: "CNC Machine A",
      team: "Mechanics",
      status: "In Progress",
      priority: "High",
    },
    {
      id: 2,
      subject: "Software Update",
      equipment: "Laptop 01",
      team: "IT Support",
      status: "New",
      priority: "Medium",
    },
    {
      id: 3,
      subject: "Belt Replacement",
      equipment: "Conveyor Belt",
      team: "Mechanics",
      status: "New",
      priority: "High",
    },
    {
      id: 4,
      subject: "Display Issue",
      equipment: "Monitor 05",
      team: "IT Support",
      status: "Repaired",
      priority: "Low",
    },
  ]

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case "admin":
        return {
          title: "Admin Dashboard",
          subtitle: "System overview and administrative controls",
          actions: [
            { label: "View All Users", href: "#", icon: Users },
            { label: "System Reports", href: "#", icon: "📊" },
            { label: "Settings", href: "#", icon: "⚙️" },
            { label: "Audit Logs", href: "#", icon: "📋" },
          ],
        }
      case "manager":
        return {
          title: "Manager Dashboard",
          subtitle: "Create preventive maintenance and assign tasks",
          actions: [
            { label: "Create Preventive Request", href: "/requests/create", icon: Calendar },
            { label: "View Kanban Board", href: "/requests/kanban", icon: ClipboardList },
            { label: "Team Performance", href: "#", icon: "📊" },
            { label: "Equipment Status", href: "/equipment", icon: PackageOpen },
          ],
        }
      case "technician":
        return {
          title: "Technician Dashboard",
          subtitle: "View and manage your assigned maintenance tasks",
          actions: [
            { label: "My Assignments", href: "/requests/kanban", icon: ClipboardList },
            { label: "View Calendar", href: "/requests/calendar", icon: Calendar },
            { label: "Equipment Details", href: "/equipment", icon: PackageOpen },
            { label: "Log Work Hours", href: "#", icon: "⏱️" },
          ],
        }
      case "equipment-owner":
        return {
          title: "Equipment Owner Dashboard",
          subtitle: "Submit and track maintenance requests",
          actions: [
            { label: "Submit Request", href: "/requests/create", icon: AlertCircle },
            { label: "My Equipment", href: "/equipment", icon: PackageOpen },
            { label: "Request History", href: "#", icon: "📜" },
            { label: "Support", href: "#", icon: "❓" },
          ],
        }
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome back! Here's an overview of your maintenance operations.",
          actions: [],
        }
    }
  }

  const roleContent = getRoleSpecificContent()

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center md:ml-64">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{roleContent.title}</h1>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {roleLabels[userRole]}
              </span>
            </div>
            <p className="text-muted-foreground">{roleContent.subtitle}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Role-specific quick actions and recent requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Requests</h2>
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{request.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.equipment} • {request.team}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          request.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : request.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.priority}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          request.status === "New"
                            ? "bg-blue-100 text-blue-800"
                            : request.status === "In Progress"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {roleContent.actions.map((action, idx) => (
                  <Link key={idx} href={action.href}>
                    <Button
                      variant={idx === 0 ? "default" : "outline"}
                      className={`w-full justify-start ${idx === 0 ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-transparent"}`}
                    >
                      {typeof action.icon === "string" ? (
                        <span className="mr-2">{action.icon}</span>
                      ) : (
                        <action.icon className="w-4 h-4 mr-2" />
                      )}
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
