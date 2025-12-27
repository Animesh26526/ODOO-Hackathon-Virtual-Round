"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const teams = [
  { id: 1, name: "Maintenance Team A", members: 5, activeJobs: 3 },
  { id: 2, name: "Maintenance Team B", members: 4, activeJobs: 2 },
  { id: 3, name: "Emergency Response", members: 3, activeJobs: 1 },
]

export default function TeamsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Teams</h2>
          <p className="text-muted-foreground mt-1">Manage maintenance teams and assignments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="text-lg">{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{team.members}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{team.activeJobs}</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Team
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
