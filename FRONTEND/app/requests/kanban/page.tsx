"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Request {
  id: number
  subject: string
  equipment: string
  team: string
  assignedTo?: string
  status: "new" | "in-progress" | "repaired" | "scrap"
  priority: "High" | "Medium" | "Low"
  createdDate: string
  isOverdue?: boolean
}

export default function KanbanBoard() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      subject: "Leaking Oil",
      equipment: "CNC Machine A",
      team: "Mechanics",
      assignedTo: "Robert Martinez",
      status: "in-progress",
      priority: "High",
      createdDate: "2024-01-10",
      isOverdue: true,
    },
    {
      id: 2,
      subject: "Software Update",
      equipment: "Laptop 01",
      team: "IT Support",
      status: "new",
      priority: "Medium",
      createdDate: "2024-01-15",
    },
    {
      id: 3,
      subject: "Belt Replacement",
      equipment: "Conveyor Belt",
      team: "Mechanics",
      status: "new",
      priority: "High",
      createdDate: "2024-01-18",
    },
    {
      id: 4,
      subject: "Display Issue",
      equipment: "Monitor 05",
      team: "IT Support",
      assignedTo: "Alice Thompson",
      status: "repaired",
      priority: "Low",
      createdDate: "2024-01-08",
    },
    {
      id: 5,
      subject: "Bearing Replacement",
      equipment: "Forklift 02",
      team: "Mechanics",
      status: "new",
      priority: "High",
      createdDate: "2024-01-19",
    },
    {
      id: 6,
      subject: "Electrical Inspection",
      equipment: "CNC Machine A",
      team: "Electricians",
      status: "scrap",
      priority: "Medium",
      createdDate: "2024-01-05",
    },
  ])

  const [draggedCard, setDraggedCard] = useState<Request | null>(null)

  const columns = [
    { id: "new", label: "New", color: "bg-blue-50 dark:bg-blue-950", badgeColor: "bg-blue-500" },
    { id: "in-progress", label: "In Progress", color: "bg-orange-50 dark:bg-orange-950", badgeColor: "bg-orange-500" },
    { id: "repaired", label: "Repaired", color: "bg-green-50 dark:bg-green-950", badgeColor: "bg-green-500" },
    { id: "scrap", label: "Scrap", color: "bg-gray-50 dark:bg-gray-900", badgeColor: "bg-gray-500" },
  ]

  const handleDragStart = (request: Request) => {
    setDraggedCard(request)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: string) => {
    if (draggedCard && draggedCard.status !== status) {
      setRequests(requests.map((r) => (r.id === draggedCard.id ? { ...r, status: status as any } : r)))
      setDraggedCard(null)
    }
  }

  const RequestCard = ({ request }: { request: Request }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(request)}
      className="bg-card border border-border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground flex-1">{request.subject}</h4>
          {request.isOverdue && <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground">{request.equipment}</p>
        <p className="text-xs text-muted-foreground">{request.team}</p>

        {request.assignedTo && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {request.assignedTo
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-xs text-muted-foreground">{request.assignedTo}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded text-white ${
              request.priority === "High"
                ? "bg-destructive"
                : request.priority === "Medium"
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
          >
            {request.priority}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Requests (Kanban)</h1>
              <p className="text-muted-foreground">Drag and drop to manage request lifecycle.</p>
            </div>
            <Link href="/requests/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => {
              const columnRequests = requests.filter((r) => r.status === column.id)
              return (
                <div
                  key={column.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                  className={`${column.color} rounded-lg p-4 min-h-[600px] flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.badgeColor}`} />
                      {column.label}
                    </h2>
                    <span className="bg-background text-foreground text-xs font-bold px-2 py-1 rounded">
                      {columnRequests.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-3">
                    {columnRequests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
