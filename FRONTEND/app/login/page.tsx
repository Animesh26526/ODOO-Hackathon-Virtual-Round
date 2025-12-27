"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateEmail, validatePassword } from "@/lib/validation"

const ROLES = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access, manage users, configurations, and reports",
    icon: "👨‍💼",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Create preventive maintenance, assign tasks, view reports",
    icon: "👷",
  },
  {
    id: "technician",
    name: "Technician",
    description: "View assigned requests, update status, log work hours",
    icon: "🔧",
  },
  {
    id: "equipment-owner",
    name: "Equipment Owner",
    description: "Submit maintenance requests, track equipment status",
    icon: "📋",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "credentials">("role")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setStep("credentials")
    setEmailError("")
    setPasswordError("")
  }

  const handleBackToRoles = () => {
    setStep("role")
    setSelectedRole(null)
    setEmail("")
    setPassword("")
    setEmailError("")
    setPasswordError("")
    setRememberMe(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)

    setEmailError(emailValidation.error || "")
    setPasswordError(passwordValidation.error || "")

    if (!emailValidation.valid || !passwordValidation.valid) {
      return
    }

    setLoading(true)

    // Simulate login
    setTimeout(() => {
      if (selectedRole) {
        localStorage.setItem("userRole", selectedRole)
        localStorage.setItem("userEmail", email)
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
          localStorage.setItem("rememberedEmail", email)
        } else {
          localStorage.removeItem("rememberMe")
          localStorage.removeItem("rememberedEmail")
        }
      }
      setLoading(false)
      router.push("/dashboard")
    }, 600)
  }

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe") === "true"
    if (rememberMe) {
      const rememberedEmail = localStorage.getItem("rememberedEmail")
      if (rememberedEmail) {
        setEmail(rememberedEmail)
        setRememberMe(true)
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">GG</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">GearGuard</h1>
          </div>
        </div>

        {step === "role" ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Select your role to continue</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="group relative p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{role.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    </div>
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </div>
          </div>
        ) : (
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={handleBackToRoles} className="text-primary hover:text-primary/80 transition-colors">
                  ←
                </button>
                <div>
                  <CardTitle className="text-xl">{ROLES.find((r) => r.id === selectedRole)?.name}</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError("")
                    }}
                    className={`bg-background border-border focus:border-primary ${
                      emailError ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError("")
                    }}
                    className={`bg-background border-border focus:border-primary ${
                      passwordError ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border cursor-pointer"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
