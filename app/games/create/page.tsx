"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Profile {
    id: string
    username: string
}

function CreateGameForm() {
    const [gameName, setGameName] = useState("")
    const [partnerId, setPartnerId] = useState("")
    const [partnerName, setPartnerName] = useState("")
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const getCurrentUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()
            setCurrentProfile(profile)
        }
        getCurrentUser()

        // Check if partner info is passed from search
        const partner = searchParams.get("partner")
        const partnerNameParam = searchParams.get("partnerName")

        if (partner && partnerNameParam) {
            setPartnerId(partner)
            setPartnerName(partnerNameParam)
        }
    }, [searchParams, router])

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentProfile || !partnerId) return
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from("soul_link_games")
                .insert({
                    name: gameName.trim(),
                    player1_id: currentProfile.id,
                    player2_id: partnerId,
                })
                .select()
                .single()
            if (error) throw error

            await supabase.from("death_statistics").insert([
                { game_id: data.id, player_id: currentProfile.id, death_count: 0 },
                { game_id: data.id, player_id: partnerId, death_count: 0 },
            ])

            router.push(`/games/${data.id}`)
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Failed to create game")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!currentProfile) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={currentProfile.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Game</h1>
                        <p className="text-muted-foreground">Start a new soul link adventure with another trainer.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Game Details</CardTitle>
                            <CardDescription>
                                {partnerName ? `Creating a game with ${partnerName}` : "Set up your soul link game"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateGame} className="space-y-6">
                                <div className="p-2">
                                    <Label htmlFor="gameName" className="mb-2">Game Name</Label>
                                    <Input
                                        id="gameName"
                                        type="text"
                                        placeholder="e.g., Kanto Soul Link Challenge"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value)}
                                        required
                                    />
                                </div>

                                {partnerName ? (
                                    <div className="p-4 bg-muted rounded-lg ml-2 mr-2">
                                        <Label className="text-sm font-medium">Partner</Label>
                                        <p className="text-foreground">{partnerName}</p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            No partner selected. You can{" "}
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="p-0 h-auto text-yellow-800 dark:text-yellow-200 underline"
                                                onClick={() => router.push("/find-player")}
                                            >
                                                find a player
                                            </Button>{" "}
                                            first.
                                        </p>
                                    </div>
                                )}

                                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                                <div className="flex space-x-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading || !partnerId || !gameName.trim()} className="flex-1">
                                        {isLoading ? "Creating..." : "Create Game"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function CreateGamePage() {
    return (
        <Suspense fallback={(
            <div className="min-h-screen bg-background">
                <LoadingSpinner />
            </div>
        )}>
            <CreateGameForm />
        </Suspense>
    )
}
