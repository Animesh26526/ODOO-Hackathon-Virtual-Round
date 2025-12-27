"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - fixed positioning */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main content - shifted right by sidebar width */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        {/* Content area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
