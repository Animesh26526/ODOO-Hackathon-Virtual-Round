"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1))

  // Mock preventive maintenance requests
  const maintenanceEvents = [
    { date: "2024-01-05", subject: "Oil Change", equipment: "CNC Machine A", team: "Mechanics" },
    { date: "2024-01-10", subject: "Filter Replacement", equipment: "Conveyor Belt", team: "Mechanics" },
    { date: "2024-01-15", subject: "System Update", equipment: "Laptop 01", team: "IT Support" },
    { date: "2024-01-20", subject: "Electrical Inspection", equipment: "Production Floor", team: "Electricians" },
    { date: "2024-01-25", subject: "Bearing Check", equipment: "Forklift 02", team: "Mechanics" },
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Schedule</h1>
              <p className="text-muted-foreground">View and manage preventive maintenance schedules.</p>
            </div>
            <Link href="/requests/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const dateStr = day
                    ? `2024-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    : null
                  const eventsForDay = dateStr ? maintenanceEvents.filter((e) => e.date === dateStr) : []

                  return (
                    <div
                      key={idx}
                      className={`min-h-24 p-2 rounded border ${
                        day ? "bg-card border-border hover:bg-muted/50" : "bg-muted/20 border-transparent"
                      }`}
                    >
                      {day && (
                        <>
                          <p className="font-semibold text-sm text-foreground mb-1">{day}</p>
                          <div className="space-y-1">
                            {eventsForDay.map((event, i) => (
                              <div key={i} className="text-xs bg-primary/10 text-primary p-1 rounded truncate">
                                {event.subject}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Maintenance</h3>
              <div className="space-y-3">
                {maintenanceEvents.slice(0, 5).map((event, idx) => (
                  <div key={idx} className="p-3 border border-border rounded-lg bg-muted/50">
                    <p className="font-medium text-foreground text-sm">{event.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.equipment}</p>
                    <p className="text-xs text-muted-foreground">{event.team}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
