"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

// Mock data for maintenance requests
const initialRequests = {
  new: [
    {
      id: "req-1",
      subject: "Compressor belt replacement",
      equipment: "Compressor A1",
      technician: { name: "John Smith", initials: "JS" },
      dueDate: new Date(2025, 0, 5),
    },
    {
      id: "req-2",
      subject: "Pump seal inspection",
      equipment: "Pump B2",
      technician: { name: "Sarah Johnson", initials: "SJ" },
      dueDate: new Date(2024, 11, 25),
    },
  ],
  "in-progress": [
    {
      id: "req-3",
      subject: "Motor bearing lubrication",
      equipment: "Motor C1",
      technician: { name: "Mike Wilson", initials: "MW" },
      dueDate: new Date(2025, 0, 8),
    },
    {
      id: "req-4",
      subject: "Hydraulic fluid replacement",
      equipment: "Hydraulic Press D1",
      technician: { name: "Emily Brown", initials: "EB" },
      dueDate: new Date(2024, 11, 28),
    },
    {
      id: "req-5",
      subject: "Fan motor cleaning",
      equipment: "Cooling Fan E1",
      technician: { name: "John Smith", initials: "JS" },
      dueDate: new Date(2025, 0, 10),
    },
  ],
  repaired: [
    {
      id: "req-6",
      subject: "Valve stem replacement",
      equipment: "Pressure Valve F1",
      technician: { name: "David Lee", initials: "DL" },
      dueDate: new Date(2025, 0, 2),
    },
    {
      id: "req-7",
      subject: "Belt drive alignment",
      equipment: "Conveyor G1",
      technician: { name: "Sarah Johnson", initials: "SJ" },
      dueDate: new Date(2024, 12, 30),
    },
  ],
  scrap: [
    {
      id: "req-8",
      subject: "Decommission old motor",
      equipment: "Motor H1 (Old)",
      technician: { name: "Mike Wilson", initials: "MW" },
      dueDate: new Date(2024, 11, 20),
    },
  ],
}

// Technician colors for avatars
const technicianColors: Record<string, string> = {
  JS: "bg-blue-500",
  SJ: "bg-purple-500",
  MW: "bg-green-500",
  EB: "bg-pink-500",
  DL: "bg-orange-500",
}

export default function KanbanPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null)

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date()
  }

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result

    // If dropped outside valid area
    if (!destination) return

    // If dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceColumn = source.droppableId as keyof typeof requests
    const destColumn = destination.droppableId as keyof typeof requests
    const sourceRequests = Array.from(requests[sourceColumn])
    const [movedRequest] = sourceRequests.splice(source.index, 1)

    // Update status based on destination column
    const statusMap: Record<string, string> = {
      new: "New",
      "in-progress": "In Progress",
      repaired: "Repaired",
      scrap: "Scrap",
    }

    if (sourceColumn === destColumn) {
      requests[sourceColumn] = sourceRequests
    } else {
      const destRequests = Array.from(requests[destColumn])
      destRequests.splice(destination.index, 0, movedRequest)

      setRequests({
        ...requests,
        [sourceColumn]: sourceRequests,
        [destColumn]: destRequests,
      })
      return
    }

    setRequests({ ...requests })
  }

  const columns = [
    { key: "new", title: "New", icon: null },
    { key: "in-progress", title: "In Progress" },
    { key: "repaired", title: "Repaired" },
    { key: "scrap", title: "Scrap" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Kanban Board</h2>
        <p className="text-muted-foreground mt-1">Visualize maintenance workflow</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 auto-cols-max overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.key} className="flex-shrink-0 w-full lg:w-80">
              <Droppable droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-muted/40 rounded-lg p-4 min-h-96 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-semibold text-foreground text-sm">{column.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {requests[column.key as keyof typeof requests].length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {requests[column.key as keyof typeof requests].map((request, index) => {
                        const overdue = isOverdue(request.dueDate)
                        return (
                          <Draggable key={request.id} draggableId={request.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card rounded-lg p-4 shadow-sm transition-all border ${
                                  overdue
                                    ? "border-destructive/50 bg-destructive/5"
                                    : "border-border hover:border-primary/50"
                                } ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
                              >
                                {/* Overdue indicator */}
                                {overdue && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    <span className="text-xs font-semibold text-destructive">Overdue</span>
                                  </div>
                                )}

                                {/* Request subject */}
                                <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                                  {request.subject}
                                </h4>

                                {/* Equipment name */}
                                <p className="text-xs text-muted-foreground mb-3">{request.equipment}</p>

                                {/* Footer with technician and date */}
                                <div className="flex items-center justify-between">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback
                                      className={`text-white text-xs ${
                                        technicianColors[request.technician.initials] || "bg-primary"
                                      }`}
                                    >
                                      {request.technician.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span
                                    className={`text-xs font-medium ${
                                      overdue ? "text-destructive" : "text-muted-foreground"
                                    }`}
                                  >
                                    {request.dueDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
