"use client"

import { Card, CardContent } from "@/components/ui/card"

const kanbanData = {
  todo: [{ id: 1, title: "Hydraulic system check", equipment: "Press D1" }],
  inProgress: [
    { id: 2, title: "Motor bearing replacement", equipment: "Motor B3" },
    { id: 3, title: "Pump seal inspection", equipment: "Pump A1" },
  ],
  done: [
    { id: 4, title: "Compressor maintenance", equipment: "Compressor C2" },
    { id: 5, title: "Valve calibration", equipment: "Valve E2" },
  ],
}

export default function KanbanPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Kanban Board</h2>
        <p className="text-muted-foreground mt-1">Visualize maintenance workflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(kanbanData).map(([column, tasks]: [string, any[]]) => (
          <div key={column} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground capitalize">{column.replace(/([A-Z])/g, " $1").trim()}</h3>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{tasks.length}</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="cursor-move hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <p className="font-medium text-sm text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">{task.equipment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
