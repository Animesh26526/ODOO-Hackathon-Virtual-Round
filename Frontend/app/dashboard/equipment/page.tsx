"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Wrench, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock equipment data
const equipmentList = [
  {
    id: 1,
    name: "Pump Unit A1",
    serialNumber: "PMP-2024-001",
    department: "Production",
    location: "Floor 1, Zone A",
    team: "Team Alpha",
    purchaseDate: "2023-06-15",
    warrantyExpiry: "2025-06-15",
    openRequests: 2,
    status: "Active",
  },
  {
    id: 2,
    name: "Motor B3",
    serialNumber: "MOT-2024-002",
    department: "Production",
    location: "Floor 2, Zone B",
    team: "Team Beta",
    purchaseDate: "2022-03-10",
    warrantyExpiry: "2024-03-10",
    openRequests: 0,
    status: "Active",
  },
  {
    id: 3,
    name: "Compressor C2",
    serialNumber: "CMP-2024-003",
    department: "Utilities",
    location: "Floor 1, Basement",
    team: "Team Alpha",
    purchaseDate: "2021-11-20",
    warrantyExpiry: "2023-11-20",
    openRequests: 3,
    status: "Active",
  },
  {
    id: 4,
    name: "Conveyor Belt D4",
    serialNumber: "CON-2024-004",
    department: "Logistics",
    location: "Floor 3, Zone C",
    team: "Team Gamma",
    purchaseDate: "2024-01-05",
    warrantyExpiry: "2026-01-05",
    openRequests: 1,
    status: "Active",
  },
  {
    id: 5,
    name: "Hydraulic Press E5",
    serialNumber: "HYD-2024-005",
    department: "Production",
    location: "Floor 2, Zone D",
    team: "Team Beta",
    purchaseDate: "2020-08-12",
    warrantyExpiry: "2022-08-12",
    openRequests: 4,
    status: "Inactive",
  },
]

// Mock maintenance requests for equipment
const maintenanceRequests = {
  1: [
    { id: 101, type: "Preventive", status: "Scheduled", date: "2024-04-10" },
    { id: 102, type: "Corrective", status: "In Progress", date: "2024-03-28" },
  ],
  2: [],
  3: [
    { id: 103, type: "Preventive", status: "Pending", date: "2024-03-15" },
    { id: 104, type: "Inspection", status: "Scheduled", date: "2024-04-05" },
    { id: 105, type: "Corrective", status: "Pending", date: "2024-03-22" },
  ],
  4: [{ id: 106, type: "Preventive", status: "Scheduled", date: "2024-04-12" }],
  5: [
    { id: 107, type: "Corrective", status: "Pending", date: "2024-03-18" },
    { id: 108, type: "Inspection", status: "Pending", date: "2024-03-25" },
    { id: 109, type: "Corrective", status: "Pending", date: "2024-04-01" },
    { id: 110, type: "Preventive", status: "Pending", date: "2024-04-08" },
  ],
}

interface Equipment {
  id: number
  name: string
  serialNumber: string
  department: string
  location: string
  team: string
  purchaseDate: string
  warrantyExpiry: string
  openRequests: number
  status: "Active" | "Inactive"
}

export default function EquipmentPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showMaintenanceRequests, setShowMaintenanceRequests] = useState(false)

  const isWarrantyExpired = (expiry: string) => {
    return new Date(expiry) < new Date()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Equipment</h2>
          <p className="text-muted-foreground mt-1">Manage all equipment and track maintenance history</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Equipment table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Serial Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Team</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((equipment) => (
                  <tr
                    key={equipment.id}
                    onClick={() => setSelectedEquipment(equipment)}
                    className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 text-foreground font-medium">{equipment.name}</td>
                    <td className="py-4 px-4 text-muted-foreground text-xs font-mono">{equipment.serialNumber}</td>
                    <td className="py-4 px-4 text-muted-foreground">{equipment.department}</td>
                    <td className="py-4 px-4 text-muted-foreground">{equipment.location}</td>
                    <td className="py-4 px-4 text-muted-foreground">{equipment.team}</td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEquipment(equipment)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Detail Modal */}
      <Dialog open={!!selectedEquipment} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEquipment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEquipment.name}</DialogTitle>
                <DialogDescription>{selectedEquipment.serialNumber}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Equipment Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Serial Number</p>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedEquipment.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</p>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedEquipment.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedEquipment.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned Team</p>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedEquipment.team}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Purchase Date</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {formatDate(selectedEquipment.purchaseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Warranty Expires
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(selectedEquipment.warrantyExpiry)}
                      </p>
                      {isWarrantyExpired(selectedEquipment.warrantyExpiry) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Smart Button - Maintenance Requests */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Maintenance</p>
                  <Button
                    onClick={() => setShowMaintenanceRequests(!showMaintenanceRequests)}
                    className="w-full gap-2 h-auto py-3 flex items-center justify-between px-4"
                    variant={selectedEquipment.openRequests > 0 ? "default" : "outline"}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>Maintenance Requests</span>
                    </div>
                    <Badge variant={selectedEquipment.openRequests > 0 ? "secondary" : "outline"}>
                      {selectedEquipment.openRequests}
                    </Badge>
                  </Button>

                  {/* Maintenance Requests List */}
                  {showMaintenanceRequests &&
                    maintenanceRequests[selectedEquipment.id as keyof typeof maintenanceRequests]?.length > 0 && (
                      <div className="mt-4 space-y-2 bg-muted/30 rounded-lg p-4 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          Open Requests
                        </p>
                        {maintenanceRequests[selectedEquipment.id as keyof typeof maintenanceRequests].map(
                          (request) => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between p-2 bg-background rounded border border-border text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{request.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {request.status}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(request.date)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                  {showMaintenanceRequests &&
                    maintenanceRequests[selectedEquipment.id as keyof typeof maintenanceRequests]?.length === 0 && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        No open maintenance requests
                      </div>
                    )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
