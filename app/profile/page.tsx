"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Profile {
    id: string
    username: string
    created_at: string
    updated_at: string
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [username, setUsername] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const getProfile = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
            if (profileData) {
                setProfile(profileData)
                setUsername(profileData.username)
            }
        }

        getProfile()
    }, [router])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    username: username.trim(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", profile.id)

            if (error) throw error

            setSuccess("Profile updated successfully!")
            setProfile({ ...profile, username: username.trim() })
        } catch (error: any) {
            setError(error.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={profile.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your trainer profile and account settings.</p>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your trainer details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="p-2">
                                    <Label className="mb-2" htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                        minLength={3}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your username is how other trainers will find you
                                    </p>
                                </div>

                                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                                {success && (
                                    <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                                        {success}
                                    </div>
                                )}

                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Updating..." : "Update Profile"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Account Created</Label>
                                    <p className="text-sm text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Last Updated</Label>
                                    <p className="text-sm text-muted-foreground">{new Date(profile.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
