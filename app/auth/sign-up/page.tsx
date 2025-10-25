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

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                router.push("/dashboard")
            }
            setIsCheckingAuth(false)
        }

        checkAuth()
    }, [router])

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        if (password !== repeatPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        if (username.length < 3) {
            setError("Username must be at least 3 characters long")
            setIsLoading(false)
            return
        }

        try {
            const { data: existingUsers, error: fetchError } = await supabase
                .from("profiles")
                .select("email")
                .eq("email", email)
                .limit(1)
            if (fetchError) throw fetchError
            if (existingUsers && existingUsers.length > 0) {
                setError("Email already registered. Please log in.")
                setIsLoading(false)
                return
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
                    data: {
                        username: username,
                        email: email,
                    },
                },
            })
            if (error) throw error
            router.push("/auth/check-email")
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
                        <p className="text-muted-foreground mt-2">Join the soul link community</p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Sign up</CardTitle>
                            <CardDescription>Create your trainer account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignUp}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="ash_ketchum"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="trainer@pokemon.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="repeat-password">Repeat Password</Label>
                                        <Input
                                            id="repeat-password"
                                            type="password"
                                            required
                                            value={repeatPassword}
                                            onChange={(e) => setRepeatPassword(e.target.value)}
                                        />
                                    </div>
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Creating account...</span>
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/auth/login" className="underline underline-offset-4 text-primary hover:text-primary/80">
                                        Login
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
