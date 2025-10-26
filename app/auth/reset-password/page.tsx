"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying reset link...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {success ? (
                            <div className="space-y-4">
                                <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                    Password reset successfully! Redirecting to login...
                                </div>
                            </div>
                        ) : error ? (
                            <div className="space-y-4">
                                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                    {error}
                                </div>
                                <Link href="/auth/forgot-password">
                                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                        Request New Link
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Resetting...</span>
                                        </div>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        )}
                        {!error && !success && (
                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                    Back to login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
