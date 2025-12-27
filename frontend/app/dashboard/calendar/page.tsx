"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Clock, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

// Mock maintenance schedule data
const maintenanceSchedule = [
  {
    id: 1,
    date: "2025-01-08",
    subject: "Pump A1 - Oil Change",
    equipment: "Pump A1",
    technician: "John Smith",
    duration: "2 hours",
    priority: "High",
  },
  {
    id: 2,
    date: "2025-01-10",
    subject: "Compressor C2 - Filter Replacement",
    equipment: "Compressor C2",
    technician: "Sarah Johnson",
    duration: "1.5 hours",
    priority: "Medium",
  },
  {
    id: 3,
    date: "2025-01-15",
    subject: "Motor B3 - Lubrication Service",
    equipment: "Motor B3",
    technician: "Mike Wilson",
    duration: "1 hour",
    priority: "Low",
  },
  {
    id: 4,
    date: "2025-01-18",
    subject: "Conveyor System - Belt Inspection",
    equipment: "Conveyor System",
    technician: "Emily Davis",
    duration: "3 hours",
    priority: "High",
  },
  {
    id: 5,
    date: "2025-01-22",
    subject: "Pump A1 - Bearing Check",
    equipment: "Pump A1",
    technician: "John Smith",
    duration: "1 hour",
    priority: "Medium",
  },
  {
    id: 6,
    date: "2025-01-28",
    subject: "Industrial Lathe - Coolant Flush",
    equipment: "Industrial Lathe",
    technician: "David Brown",
    duration: "2.5 hours",
    priority: "High",
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedEvent, setSelectedEvent] = useState<(typeof maintenanceSchedule)[0] | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const formatDateString = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    return `${currentDate.getFullYear()}-${month}-${dayStr}`
  }

  const getEventsForDate = (day: number) => {
    const dateStr = formatDateString(day)
    return maintenanceSchedule.filter((task) => task.date === dateStr)
  }

  const handleEventClick = (event: (typeof maintenanceSchedule)[0]) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      case "Medium":
        return "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
      default:
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Maintenance Calendar</h2>
          <p className="text-muted-foreground mt-1">View and manage your maintenance schedule</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">{monthName}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="text-white hover:bg-white/20">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-white hover:bg-white/20">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-lg bg-muted/30" />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDate(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg border-2 p-2 transition-all ${
                    isToday
                      ? "border-primary bg-primary/5"
                      : dayEvents.length > 0
                        ? "border-amber-200 bg-amber-50 dark:bg-amber-950/30"
                        : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </span>
                    <div className="flex-1 space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left text-xs bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded truncate hover:bg-amber-300 dark:hover:bg-amber-600 transition-colors"
                        >
                          {event.subject}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium px-1.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Upcoming Schedule List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Scheduled Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceSchedule.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => handleEventClick(task)}
                className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{task.subject}</h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Wrench className="w-4 h-4" />
                      {task.equipment}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {task.duration}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={priorityColor(task.priority)}>{task.priority}</Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(task.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maintenance Task Details</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <p className="text-foreground font-semibold mt-1">{selectedEvent.subject}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Equipment</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.equipment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-foreground font-semibold mt-1">
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Technician</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.technician}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.duration}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">
                  <Badge className={priorityColor(selectedEvent.priority)}>{selectedEvent.priority}</Badge>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEventModal(false)}>
                  Close
                </Button>
                <Button>Edit Task</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
