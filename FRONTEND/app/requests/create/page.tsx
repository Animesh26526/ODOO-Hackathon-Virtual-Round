"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateRequest() {
  const [formData, setFormData] = useState({
    subject: "",
    equipment: "",
    team: "",
    type: "corrective",
    scheduledDate: "",
    description: "",
    priority: "Medium",
  })

  const equipmentOptions = [
    { id: 1, name: "CNC Machine A", team: "Mechanics" },
    { id: 2, name: "Laptop 01", team: "IT Support" },
    { id: 3, name: "Conveyor Belt", team: "Mechanics" },
    { id: 4, name: "Forklift 02", team: "Mechanics" },
    { id: 5, name: "Monitor 05", team: "IT Support" },
  ]

  const handleEquipmentChange = (equipmentName: string) => {
    const selected = equipmentOptions.find((e) => e.name === equipmentName)
    setFormData({
      ...formData,
      equipment: equipmentName,
      team: selected?.team || "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <Link href="/requests/kanban">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Maintenance Request</h1>
            </div>
          </div>

          {/* Form */}
          <Card className="max-w-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Request Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                    <SelectItem value="preventive">Preventive (Routine Checkup)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Equipment <span className="text-destructive">*</span>
                </label>
                <Select value={formData.equipment} onValueChange={handleEquipmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentOptions.map((eq) => (
                      <SelectItem key={eq.id} value={eq.name}>
                        {eq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Auto-fills team based on equipment assignment</p>
              </div>

              {/* Team (Auto-filled) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Maintenance Team</label>
                <Input
                  value={formData.team}
                  readOnly
                  className="bg-muted text-muted-foreground"
                  placeholder="Auto-filled based on equipment"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="What is wrong? (e.g., Leaking Oil)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Date (for Preventive) */}
              {formData.type === "preventive" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Scheduled Date</label>
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  placeholder="Additional details about the maintenance request..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create Request
                </Button>
                <Link href="/requests/kanban">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
