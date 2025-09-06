"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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

interface Game {
    id: string
    name: string
    player1_id: string
    player2_id: string
}

export default function AddPokemonPage() {
    const [pokemon1Name, setPokemon1Name] = useState("")
    const [pokemon1Nickname, setPokemon1Nickname] = useState("")
    const [pokemon2Name, setPokemon2Name] = useState("")
    const [pokemon2Nickname, setPokemon2Nickname] = useState("")
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [game, setGame] = useState<Game | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const params = useParams()
    const gameId = params.id as string

    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth/login")
                return
            }

            // Get current user's profile
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
            setCurrentProfile(profile)

            // Get game details
            const { data: gameData } = await supabase.from("soul_link_games").select("*").eq("id", gameId).single()
            if (!gameData || (gameData.player1_id !== user.id && gameData.player2_id !== user.id)) {
                router.push("/games")
                return
            }

            setGame(gameData)
        }

        loadData()
    }, [gameId, router])

    const handleAddPokemon = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentProfile || !game) return

        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { error } = await supabase.from("pokemon_pairs").insert({
                game_id: gameId,
                pokemon1_name: pokemon1Name.trim(),
                pokemon1_nickname: pokemon1Nickname.trim() || null,
                pokemon2_name: pokemon2Name.trim(),
                pokemon2_nickname: pokemon2Nickname.trim() || null,
                is_dead: false,
            })
            if (error) throw error

            window.location.href = `/games/${gameId}`
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Failed to add pokemon pair")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!currentProfile || !game) {
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
                        <h1 className="text-3xl font-bold text-foreground mb-2">Add Pokemon Pair</h1>
                        <p className="text-muted-foreground">Link two Pokemon together for your soul link adventure.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pokemon Soul Link Pair</CardTitle>
                            <CardDescription>
                                Enter the details for both Pokemon that will be linked together. If one dies, both die.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddPokemon} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-primary">Pokemon 1</h3>
                                        <div className="p-2">
                                            <Label className="mb-2" htmlFor="pokemon1Name">Species</Label>
                                            <Input
                                                id="pokemon1Name"
                                                type="text"
                                                placeholder="e.g., Pikachu"
                                                value={pokemon1Name}
                                                onChange={(e) => setPokemon1Name(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="p-2">
                                            <Label className="mb-2" htmlFor="pokemon1Nickname">Nickname (Optional)</Label>
                                            <Input
                                                id="pokemon1Nickname"
                                                type="text"
                                                placeholder="e.g., Sparky"
                                                value={pokemon1Nickname}
                                                onChange={(e) => setPokemon1Nickname(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-accent">Pokemon 2</h3>
                                        <div className="p-2">
                                            <Label className="mb-2" htmlFor="pokemon2Name">Species</Label>
                                            <Input
                                                id="pokemon2Name"
                                                type="text"
                                                placeholder="e.g., Charmander"
                                                value={pokemon2Name}
                                                onChange={(e) => setPokemon2Name(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="p-2">
                                            <Label className="mb-2" htmlFor="pokemon2Nickname">Nickname (Optional)</Label>
                                            <Input
                                                id="pokemon2Nickname"
                                                type="text"
                                                placeholder="e.g., Blaze"
                                                value={pokemon2Nickname}
                                                onChange={(e) => setPokemon2Nickname(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Soul Link Rules</h4>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• These Pokemon are now linked together</li>
                                        <li>• If one Pokemon faints/dies, both must be released</li>
                                        <li>• Both trainers are responsible for keeping them alive</li>
                                    </ul>
                                </div>

                                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                                <div className="flex space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !pokemon1Name.trim() || !pokemon2Name.trim()}
                                        className="flex-1"
                                    >
                                        {isLoading ? "Adding..." : "Add Pokemon Pair"}
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
