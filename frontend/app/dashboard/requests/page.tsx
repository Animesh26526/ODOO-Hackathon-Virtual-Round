"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

const requests = [
  { id: 1, title: "Pump inspection", equipment: "Pump A1", priority: "High", status: "In Progress" },
  { id: 2, title: "Motor bearing replacement", equipment: "Motor B3", priority: "Critical", status: "Pending" },
  { id: 3, title: "Compressor maintenance", equipment: "Compressor C2", priority: "Medium", status: "Scheduled" },
]

export default function RequestsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Maintenance Requests</h2>
          <p className="text-muted-foreground mt-1">Track and manage all maintenance requests</p>
        </div>
        <Link href="/dashboard/requests/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{request.title}</h3>
                  <p className="text-sm text-muted-foreground">{request.equipment}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${request.priority === "Critical" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : request.priority === "High" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"}`}
                  >
                    {request.priority}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : request.status === "Pending" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}
                  >
                    {request.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
