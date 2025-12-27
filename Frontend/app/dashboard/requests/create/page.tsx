"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

// Mock equipment data with assigned teams
const equipmentData = [
  { id: 1, name: "Pump Unit A1", team: "Team Alpha", department: "Production" },
  { id: 2, name: "Motor B3", team: "Team Beta", department: "Production" },
  { id: 3, name: "Compressor C2", team: "Team Alpha", department: "Utilities" },
  { id: 4, name: "Conveyor Belt D4", team: "Team Gamma", department: "Logistics" },
  { id: 5, name: "Hydraulic Press E5", team: "Team Beta", department: "Production" },
]

interface FormData {
  subject: string
  requestType: "preventive" | "corrective"
  equipment: string
  maintenanceTeam: string
  scheduledDate: string
  estimatedDuration: string
}

export default function CreateRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    requestType: "preventive",
    equipment: "",
    maintenanceTeam: "",
    scheduledDate: "",
    estimatedDuration: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleEquipmentChange = (equipmentId: string) => {
    setFormData((prev) => {
      const selected = equipmentData.find((e) => e.id.toString() === equipmentId)
      return {
        ...prev,
        equipment: equipmentId,
        maintenanceTeam: selected?.team || "",
      }
    })
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.subject || !formData.equipment || !formData.scheduledDate || !formData.estimatedDuration) {
      alert("Please fill in all required fields")
      return
    }

    // Mock API submission
    console.log("Submitting maintenance request:", formData)
    setSubmitted(true)

    // Reset after 2 seconds and redirect
    setTimeout(() => {
      window.location.href = "/dashboard/requests"
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="space-y-6 p-6 max-w-2xl">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Request Submitted</h3>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Your maintenance request has been created successfully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedEquipment = equipmentData.find((e) => e.id.toString() === formData.equipment)

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div>
        <Link href="/dashboard/requests" className="text-primary hover:underline text-sm font-medium">
          ← Back to Maintenance Requests
        </Link>
        <h2 className="text-3xl font-bold text-foreground mt-3">Create Maintenance Request</h2>
        <p className="text-muted-foreground mt-1">Submit a new maintenance request for equipment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                placeholder="e.g., Pump oil change, Motor bearing replacement"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {["preventive", "corrective"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="requestType"
                        value={type}
                        checked={formData.requestType === type}
                        onChange={(e) =>
                          handleInputChange("requestType", e.target.value as "preventive" | "corrective")
                        }
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground capitalize">{type}</span>
                    </label>
                  ))}
                </div>
                {formData.requestType === "preventive" && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      This will appear in the calendar schedule
                    </p>
                  </div>
                )}
              </div>

              {/* Equipment Selector with auto-fill */}
              <div>
                <label htmlFor="equipment" className="block text-sm font-semibold text-foreground mb-2">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <select
                  id="equipment"
                  value={formData.equipment}
                  onChange={(e) => handleEquipmentChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select equipment...</option>
                  {equipmentData.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-filled Maintenance Team */}
            <div>
              <label htmlFor="team" className="block text-sm font-semibold text-foreground mb-2">
                Assigned Maintenance Team
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="team"
                  type="text"
                  value={formData.maintenanceTeam}
                  disabled
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground opacity-75 cursor-not-allowed"
                />
                {formData.maintenanceTeam && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    Auto-filled
                  </Badge>
                )}
              </div>
              {!formData.equipment && (
                <p className="text-xs text-muted-foreground mt-1">Select equipment to auto-fill team</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scheduled Date */}
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-semibold text-foreground mb-2">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-foreground mb-2">
                  Estimated Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="duration"
                    type="number"
                    min="0"
                    max="999"
                    placeholder="e.g., 2"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange("estimatedDuration", e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <select className="px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Hours</option>
                    <option>Days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment Details Summary */}
            {selectedEquipment && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipment Summary</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Equipment: </span>
                    <span className="font-medium text-foreground">{selectedEquipment.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span className="font-medium text-foreground">{selectedEquipment.department}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="submit" className="flex-1">
                Create Maintenance Request
              </Button>
              <Link href="/dashboard/requests" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
