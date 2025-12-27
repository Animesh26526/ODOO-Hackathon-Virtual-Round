"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export default function Teams() {
  // Mock teams data
  const teams = [
    {
      id: 1,
      name: "Mechanics",
      description: "Specialized in equipment repairs and maintenance",
      members: [
        { id: 1, name: "Robert Martinez", role: "Senior Technician" },
        { id: 2, name: "David Lee", role: "Technician" },
        { id: 3, name: "Carlos Garcia", role: "Technician" },
      ],
      assignedEquipment: 3,
    },
    {
      id: 2,
      name: "IT Support",
      description: "Handles all IT infrastructure and device maintenance",
      members: [
        { id: 4, name: "Alice Thompson", role: "IT Manager" },
        { id: 5, name: "Michael Chen", role: "IT Technician" },
      ],
      assignedEquipment: 2,
    },
    {
      id: 3,
      name: "Electricians",
      description: "Electrical system maintenance and troubleshooting",
      members: [
        { id: 6, name: "James Wilson", role: "Lead Electrician" },
        { id: 7, name: "Patricia Johnson", role: "Electrician" },
      ],
      assignedEquipment: 1,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Maintenance Teams</h1>
              <p className="text-muted-foreground">Manage specialized maintenance teams and their members.</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Team
            </Button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="p-6 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{team.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Team Stats */}
                <div className="flex gap-6 py-4 border-y border-border mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="text-2xl font-bold text-foreground">{team.members.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Equipment</p>
                    <p className="text-2xl font-bold text-foreground">{team.assignedEquipment}</p>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-foreground">Team Members</p>
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Member Button */}
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
