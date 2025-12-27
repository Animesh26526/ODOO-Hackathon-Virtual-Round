"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Wrench } from "lucide-react"

export default function Equipment() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState("all")

  // Mock equipment data
  const equipmentList = [
    {
      id: 1,
      name: "CNC Machine A",
      serial: "CNC-001",
      dept: "Production",
      owner: "John Smith",
      team: "Mechanics",
      purchaseDate: "2021-03-15",
      warranty: "2025-03-15",
      location: "Floor 1, Section A",
      openRequests: 2,
    },
    {
      id: 2,
      name: "Laptop 01",
      serial: "LAP-001",
      dept: "IT",
      owner: "Jane Doe",
      team: "IT Support",
      purchaseDate: "2022-06-20",
      warranty: "2024-06-20",
      location: "Office Building 2",
      openRequests: 1,
    },
    {
      id: 3,
      name: "Conveyor Belt",
      serial: "CB-001",
      dept: "Production",
      owner: "Tech Team",
      team: "Mechanics",
      purchaseDate: "2020-01-10",
      warranty: "2023-01-10",
      location: "Floor 1, Section B",
      openRequests: 0,
    },
    {
      id: 4,
      name: "Forklift 02",
      serial: "FK-002",
      dept: "Warehouse",
      owner: "Mike Johnson",
      team: "Mechanics",
      purchaseDate: "2021-11-05",
      warranty: "2025-11-05",
      location: "Warehouse 3",
      openRequests: 3,
    },
    {
      id: 5,
      name: "Monitor 05",
      serial: "MON-005",
      dept: "IT",
      owner: "Sarah Wilson",
      team: "IT Support",
      purchaseDate: "2023-02-14",
      warranty: "2026-02-14",
      location: "Office Building 1",
      openRequests: 0,
    },
  ]

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serial.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = filterDept === "all" || eq.dept === filterDept
    return matchesSearch && matchesDept
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Equipment</h1>
            <p className="text-muted-foreground">Track and manage all company assets.</p>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or serial..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Warehouse">Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </div>
          </Card>

          {/* Equipment List */}
          <div className="space-y-3">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map((equipment) => (
                <Card
                  key={equipment.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border border-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{equipment.name}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {equipment.serial}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-medium text-foreground">{equipment.dept}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Owner</p>
                          <p className="font-medium text-foreground">{equipment.owner}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Team</p>
                          <p className="font-medium text-foreground">{equipment.team}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium text-foreground">{equipment.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                        <Wrench className="w-4 h-4" />
                        <span>{equipment.openRequests}</span>
                      </Button>
                      <p className="text-xs text-muted-foreground text-right">
                        Warranty until
                        <br />
                        {equipment.warranty}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No equipment found matching your criteria.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
