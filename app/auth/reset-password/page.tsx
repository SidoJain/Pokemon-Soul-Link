"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingToken, setIsCheckingToken] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkToken = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setError("Invalid or expired reset link. Please request a new one.")
            }
            setIsCheckingToken(false)
        }

        checkToken()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        const supabase = createClient()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingToken) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verifying reset link...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-primary">Pokemon Soul Link</h1>
                        <p className="text-muted-foreground mt-2">Track your soul link adventures</p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Reset Password</CardTitle>
                            <CardDescription>Enter your new password below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        Password reset successfully! Redirecting to login...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-destructive">{error}</p>
                                    <Link href="/auth/forgot-password">
                                        <Button className="w-full">Request New Link</Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter new password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="Confirm new password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        {error && <p className="text-sm text-destructive">{error}</p>}
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>Resetting...</span>
                                                </div>
                                            ) : (
                                                "Reset Password"
                                            )}
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-center text-sm">
                                        Remember your password?{" "}
                                        <Link
                                            href="/auth/login"
                                            className="underline underline-offset-4 text-primary hover:text-primary/80"
                                        >
                                            Log In
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
