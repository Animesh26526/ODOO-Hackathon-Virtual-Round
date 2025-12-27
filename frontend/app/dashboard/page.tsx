"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ArrowRight, AlertCircle, Clock, Zap, Users } from "lucide-react"
import Link from "next/link"

const dashboardData = [
  { month: "Jan", maintenance: 45, preventive: 32, emergency: 8 },
  { month: "Feb", maintenance: 52, preventive: 38, emergency: 6 },
  { month: "Mar", maintenance: 48, preventive: 35, emergency: 7 },
  { month: "Apr", maintenance: 61, preventive: 42, emergency: 5 },
  { month: "May", maintenance: 55, preventive: 39, emergency: 4 },
  { month: "Jun", maintenance: 67, preventive: 45, emergency: 3 },
]

const recentRequests = [
  {
    id: 1,
    equipment: "Pump Unit A1",
    type: "Preventive",
    status: "Scheduled",
    technician: "John Smith",
    dueDate: "2025-01-15",
    daysLeft: 2,
  },
  {
    id: 2,
    equipment: "Motor B3",
    type: "Emergency",
    status: "In Progress",
    technician: "Sarah Johnson",
    dueDate: "2025-01-10",
    daysLeft: 0,
  },
  {
    id: 3,
    equipment: "Compressor C2",
    type: "Corrective",
    status: "Completed",
    technician: "Mike Davis",
    dueDate: "2025-01-08",
    daysLeft: 0,
  },
  {
    id: 4,
    equipment: "Hydraulic Press D1",
    type: "Preventive",
    status: "Scheduled",
    technician: "Emma Wilson",
    dueDate: "2025-01-20",
    daysLeft: 5,
  },
  {
    id: 5,
    equipment: "Control Panel E2",
    type: "Emergency",
    status: "Overdue",
    technician: "John Smith",
    dueDate: "2025-01-05",
    daysLeft: -5,
  },
  {
    id: 6,
    equipment: "Conveyor Belt F1",
    type: "Preventive",
    status: "Scheduled",
    technician: "Sarah Johnson",
    dueDate: "2025-01-18",
    daysLeft: 3,
  },
]

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
}) => (
  <Card className="bg-card border-border">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>{Icon}</div>
      </div>
    </CardContent>
  </Card>
)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "Scheduled":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "Overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default function DashboardPage() {
  const criticalEquipment = 3
  const openRequests = recentRequests.filter((r) => r.status !== "Completed").length
  const technicianLoad = Math.round(openRequests / 4) // Assuming 4 technicians
  const overdueRequests = recentRequests.filter((r) => r.daysLeft < 0).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Welcome Back!</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your equipment today.</p>
        </div>
        <Link href="/dashboard/requests/create">
          <Button className="gap-2">
            <span>New Request</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Equipment"
          value={criticalEquipment}
          icon={<Zap className="w-6 h-6 text-white" />}
          color="bg-red-500"
          subtitle="Require attention"
        />
        <StatCard
          title="Open Requests"
          value={openRequests}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="bg-orange-500"
          subtitle="In queue"
        />
        <StatCard
          title="Technician Load"
          value={technicianLoad}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          subtitle="Avg per technician"
        />
        <StatCard
          title="Overdue Requests"
          value={overdueRequests}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-destructive"
          subtitle="Past due date"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Maintenance Trends</CardTitle>
            <CardDescription>Monthly maintenance requests over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="maintenance" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="preventive" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="emergency" fill="var(--color-destructive)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest equipment status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{request.equipment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{request.type}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      request.status === "In Progress"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : request.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Maintenance Requests</CardTitle>
              <CardDescription>Manage and track all equipment maintenance across your facility</CardDescription>
            </div>
            <Link href="/dashboard/requests">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Equipment</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Assigned Technician</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Due Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr
                    key={request.id}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      request.status === "Overdue" ? "bg-red-50 dark:bg-red-950/20" : ""
                    }`}
                  >
                    <td className="py-4 px-4 font-medium text-foreground">{request.equipment}</td>
                    <td className="py-4 px-4 text-muted-foreground">{request.type}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{request.technician}</td>
                    <td className="py-4 px-4 text-muted-foreground">{formatDate(request.dueDate)}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-semibold ${
                          request.daysLeft < 0
                            ? "text-red-600 dark:text-red-400"
                            : request.daysLeft === 0
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {request.daysLeft < 0 ? `${Math.abs(request.daysLeft)}d overdue` : `${request.daysLeft} days`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
