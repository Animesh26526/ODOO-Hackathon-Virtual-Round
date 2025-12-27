"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

// Mock preventive maintenance data
const preventiveRequests = [
  {
    id: 1,
    date: "2025-01-05",
    subject: "Oil Change",
    equipment: "Hydraulic Pump A1",
    technician: "John Smith",
    type: "PREVENTIVE",
  },
  {
    id: 2,
    date: "2025-01-10",
    subject: "Filter Replacement",
    equipment: "Compressor C2",
    technician: "Sarah Johnson",
    type: "PREVENTIVE",
  },
  {
    id: 3,
    date: "2025-01-15",
    subject: "Lubrication Service",
    equipment: "Motor B3",
    technician: "Mike Wilson",
    type: "PREVENTIVE",
  },
  {
    id: 4,
    date: "2025-01-18",
    subject: "Belt Inspection",
    equipment: "Conveyor System",
    technician: "Emily Davis",
    type: "PREVENTIVE",
  },
  {
    id: 5,
    date: "2025-01-22",
    subject: "Bearing Check",
    equipment: "Pump A1",
    technician: "John Smith",
    type: "PREVENTIVE",
  },
  {
    id: 6,
    date: "2025-01-28",
    subject: "Coolant Flush",
    equipment: "Industrial Lathe",
    technician: "David Brown",
    type: "PREVENTIVE",
  },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<(typeof preventiveRequests)[0] | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
    return preventiveRequests.filter((request) => request.date === dateStr)
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(formatDateString(day))
    setShowCreateModal(true)
  }

  const handleEventClick = (event: (typeof preventiveRequests)[0]) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Preventive Maintenance Schedule</h2>
          <p className="text-muted-foreground mt-1">View and manage scheduled maintenance tasks</p>
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
              const dateStr = formatDateString(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg border-2 p-2 cursor-pointer transition-all hover:shadow-md ${
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
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          className="text-xs bg-amber-200 dark:bg-amber-700 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded truncate cursor-pointer hover:bg-amber-300 dark:hover:bg-amber-600 transition-colors"
                        >
                          {event.subject}
                        </div>
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

      {/* Create Maintenance Request Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Maintenance Request</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                defaultValue={selectedDate}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Subject</label>
              <input
                type="text"
                placeholder="Maintenance task name"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Equipment</label>
              <input
                type="text"
                placeholder="Select equipment"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Assigned Technician</label>
              <input
                type="text"
                placeholder="Select technician"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>Create Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maintenance Request Details</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.subject}</p>
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
                  <label className="text-sm font-medium text-muted-foreground">Equipment</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.equipment}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Technician</label>
                  <p className="text-foreground font-semibold mt-1">{selectedEvent.technician}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
                    {selectedEvent.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEventModal(false)}>
                  Close
                </Button>
                <Button>Edit Request</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
