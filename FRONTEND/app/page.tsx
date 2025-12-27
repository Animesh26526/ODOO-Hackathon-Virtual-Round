import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">GG</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">GearGuard</h1>
            </div>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">The Ultimate Maintenance Tracker</h2>
            <p className="text-lg text-muted-foreground">
              Seamlessly manage equipment, teams, and maintenance requests in one powerful system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Equipment Tracking</h3>
              <p className="text-muted-foreground">
                Track all your assets by department or employee with detailed maintenance history.
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Team Management</h3>
              <p className="text-muted-foreground">
                Organize specialized teams and assign technicians to equipment efficiently.
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Smart Requests</h3>
              <p className="text-muted-foreground">
                Create, manage, and track maintenance requests with kanban and calendar views.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
