"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { ReloadButton } from "@/components/reload-button"

interface GameRequest {
    id: string
    sender_id: string
    receiver_id: string
    game_name: string
    game_description: string | null
    status: "pending" | "accepted" | "declined"
    created_at: string
    sender_profile?: { username: string }
    receiver_profile?: { username: string }
}

interface Profile {
    id: string
    username: string
}

export default function RequestsPage() {
    const [receivedRequests, setReceivedRequests] = useState<GameRequest[]>([])
    const [sentRequests, setSentRequests] = useState<GameRequest[]>([])
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const getCurrentUser = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
            setCurrentProfile(profile)
            await loadRequests(user.id)
        }

        getCurrentUser()
    }, [router])

    const loadRequests = async (userId: string) => {
        const supabase = createClient()

        try {
            // Load received requests
            const { data: received } = await supabase
                .from("game_requests")
                .select(`
                    *
                `)
                .eq("receiver_id", userId)
                .order("created_at", { ascending: false })

            // Load sent requests
            const { data: sent } = await supabase
                .from("game_requests")
                .select(`
                    *
                `)
                .eq("sender_id", userId)
                .order("created_at", { ascending: false })

            setReceivedRequests(received || [])
            setSentRequests(sent || [])
        } catch (error) {
            console.error("Error loading requests:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRequestResponse = async (requestId: string, response: "accepted" | "declined") => {
        const supabase = createClient()

        try {
            const { error } = await supabase.from("game_requests").update({ status: response }).eq("id", requestId)

            if (error) throw error

            if (response === "accepted") {
                // Create the game
                const request = receivedRequests.find((r) => r.id === requestId)
                if (request) {
                    const { data: game, error: gameError } = await supabase
                        .from("soul_link_games")
                        .insert({
                            name: request.game_name,
                            player1_id: request.sender_id,
                            player2_id: request.receiver_id,
                        })
                        .select()
                        .single()
                    if (gameError) throw gameError

                    // Initialize death statistics
                    await supabase.from("death_statistics").insert([
                        { game_id: game.id, player_id: request.sender_id, death_count: 0 },
                        { game_id: game.id, player_id: request.receiver_id, death_count: 0 },
                    ])

                    router.push(`/games/${game.id}`)
                    return
                }
            }

            // Reload requests
            if (currentProfile) {
                await loadRequests(currentProfile.id)
            }
        } catch (error) {
            console.error("Error responding to request:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={currentProfile?.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <div className="flex">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Game Requests</h1>
                            <ReloadButton />
                        </div>
                        <p className="text-muted-foreground">Manage your incoming and outgoing game requests.</p>
                    </div>

                    <Tabs defaultValue="received" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="received">
                                Received ({receivedRequests.filter((r) => r.status === "pending").length})
                            </TabsTrigger>
                            <TabsTrigger value="sent">Sent ({sentRequests.filter((r) => r.status === "pending").length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="received" className="space-y-4">
                            {receivedRequests.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <p className="text-muted-foreground">No game requests received yet.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                receivedRequests.map((request) => (
                                    <Card key={request.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{request.game_name}</CardTitle>
                                                    <CardDescription>
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        request.status === "pending"
                                                            ? "default"
                                                            : request.status === "accepted"
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        {request.status === "pending" && (
                                            <CardContent className="pt-0">
                                                <div className="flex space-x-2">
                                                    <Button onClick={() => handleRequestResponse(request.id, "accepted")} className="flex-1">
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleRequestResponse(request.id, "declined")}
                                                        variant="outline"
                                                        className="flex-1"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="sent" className="space-y-4">
                            {sentRequests.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-8">
                                        <p className="text-muted-foreground">No game requests sent yet.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                sentRequests.map((request) => (
                                    <Card key={request.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{request.game_name}</CardTitle>
                                                    <CardDescription>
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        request.status === "pending"
                                                            ? "default"
                                                            : request.status === "accepted"
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        {request.game_description && (
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{request.game_description}</p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
