"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateEmail } from "@/lib/validation"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "success">("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateEmail(email)
    setError(validation.error || "")

    if (!validation.valid) {
      return
    }

    setLoading(true)

    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false)
      setStep("success")
    }, 600)
  }

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

        <Card className="border border-border">
          {step === "email" ? (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>Enter your email to receive a password reset link</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        setError("")
                      }}
                      className={`bg-background border-border focus:border-primary ${
                        error ? "border-destructive focus:border-destructive" : ""
                      }`}
                    />
                    {error && <p className="text-xs text-destructive">{error}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Check Your Email</CardTitle>
                <CardDescription>Password reset instructions sent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-foreground mb-2">We've sent a password reset link to:</p>
                    <p className="font-medium text-primary">{email}</p>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Check your email and follow the link to reset your password. The link expires in 24 hours.
                  </p>

                  <Button
                    onClick={() => {
                      setEmail("")
                      setStep("email")
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send Another Email
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
