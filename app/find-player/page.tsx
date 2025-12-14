"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getPlayerCount } from "@/app/actions/get-player-count"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import type { User } from '@supabase/supabase-js'

interface Profile {
    id: string
    username: string
    created_at: string
}

export default function FindPlayerPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [playerCount, setPlayerCount] = useState<number | null>(0)
    const [searchResults, setSearchResults] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [gameName, setGameName] = useState("")
    const [requestSent, setRequestSent] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuthAndFetchCount = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth/login")
                return
            }

            setCurrentUser(user)
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            const count = await getPlayerCount()
            setPlayerCount(count)
            setCurrentProfile(profile)
        }

        checkAuthAndFetchCount()
    }, [router])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchTerm.trim()) return

        setIsLoading(true)
        setHasSearched(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .ilike("username", `%${searchTerm}%`)
                .neq("id", currentUser?.id)
                .limit(10)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendRequest = async (receiverId: string, receiverUsername: string) => {
        if (!gameName.trim()) {
            setError("Please enter a game name first")
            return
        }

        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("game_requests")
                .insert({
                    sender_id: currentUser?.id,
                    receiver_id: receiverId,
                    game_name: gameName.trim(),
                    status: "pending",
                })
            if (error) throw error

            setRequestSent(receiverUsername)
            setGameName("")
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Failed to send game request")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={currentProfile?.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Find a Player</h1>
                        <p className="text-muted-foreground">Search for other trainers to start a soul link adventure together.</p>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Search Players</CardTitle>
                            <CardDescription>
                                Enter a username to find other trainers
                                <br />
                                There are {playerCount} players to have an adventure with
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="p-2">
                                    <Label htmlFor="search" className="mb-2">Username</Label>
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Enter username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? "Searching..." : "Search"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {hasSearched && searchResults.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Game Details</CardTitle>
                                <CardDescription>Enter game details before sending requests</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-2">
                                    <Label className="mb-2" htmlFor="gameName">Game Name</Label>
                                    <Input
                                        id="gameName"
                                        type="text"
                                        placeholder="e.g., Kanto Soul Link Challenge"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value)}
                                    />
                                </div>
                                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                            </CardContent>
                        </Card>
                    )}

                    {requestSent && (
                        <Card className="mb-6">
                            <CardContent className="text-center py-6">
                                <div className="text-green-600 dark:text-green-400">
                                    <p className="font-medium">Request sent to {requestSent}!</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        They will be notified and can accept or decline your request.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {hasSearched && searchResults.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Results</CardTitle>
                                <CardDescription>
                                    Found {searchResults.length} trainer{searchResults.length !== 1 ? "s" : ""}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {searchResults.map((profile) => (
                                        <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <h3 className="font-medium">{profile.username}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Joined {new Date(profile.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => handleSendRequest(profile.id, profile.username)}
                                                size="sm"
                                                disabled={!gameName.trim() || isLoading}
                                            >
                                                {isLoading ? "Sending..." : "Send Request"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {hasSearched && searchTerm && searchResults.length === 0 && !isLoading && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No trainers found with username &ldquo;{searchTerm}&ldquo;</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
