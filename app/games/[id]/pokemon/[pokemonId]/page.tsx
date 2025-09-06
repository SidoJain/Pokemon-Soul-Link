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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    player1: { username: string }
    player2: { username: string }
}

interface PokemonPair {
    id: string
    pokemon1_name: string
    pokemon1_nickname: string | null
    pokemon2_name: string
    pokemon2_nickname: string | null
    is_dead: boolean
    responsible_player_id: string | null
}

export default function PokemonManagePage() {
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
    const [game, setGame] = useState<Game | null>(null)
    const [pokemonPair, setPokemonPair] = useState<PokemonPair | null>(null)
    const [pokemon1Nickname, setPokemon1Nickname] = useState("")
    const [pokemon2Nickname, setPokemon2Nickname] = useState("")
    const [responsiblePlayer, setResponsiblePlayer] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showDeathForm, setShowDeathForm] = useState(false)

    const router = useRouter()
    const params = useParams()
    const gameId = params.id as string
    const pokemonId = params.pokemonId as string

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

            // Get game details with player info
            const { data: gameData } = await supabase
                .from("soul_link_games")
                .select(`
                    *,
                    player1:profiles!soul_link_games_player1_id_fkey(username),
                    player2:profiles!soul_link_games_player2_id_fkey(username)
                `)
                .eq("id", gameId)
                .single()

            if (!gameData || (gameData.player1_id !== user.id && gameData.player2_id !== user.id)) {
                router.push("/games")
                return
            }
            setGame(gameData)

            // Get Pokemon pair details
            const { data: pokemonData } = await supabase
                .from("pokemon_pairs")
                .select("*")
                .eq("id", pokemonId)
                .eq("game_id", gameId)
                .single()

            if (!pokemonData) {
                router.push(`/games/${gameId}`)
                return
            }

            setPokemonPair(pokemonData)
            setPokemon1Nickname(pokemonData.pokemon1_nickname || "")
            setPokemon2Nickname(pokemonData.pokemon2_nickname || "")
        }

        loadData()
    }, [gameId, pokemonId, router])

    const handleUpdateNicknames = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pokemonPair) return

        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("pokemon_pairs")
                .update({
                    pokemon1_nickname: pokemon1Nickname.trim() || null,
                    pokemon2_nickname: pokemon2Nickname.trim() || null,
                })
                .eq("id", pokemonId)
            if (error) throw error

            setPokemonPair({
                ...pokemonPair,
                pokemon1_nickname: pokemon1Nickname.trim() || null,
                pokemon2_nickname: pokemon2Nickname.trim() || null,
            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Failed to update nicknames")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleMarkAsDead = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!pokemonPair || !responsiblePlayer) return

        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("pokemon_pairs")
                .update({
                    is_dead: true,
                    responsible_player_id: responsiblePlayer,
                    died_at: new Date().toISOString(),
                })
                .eq("id", pokemonId)

            if (error) throw error

            router.push(`/games/${gameId}`)
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError("Failed to mark pair as dead")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!currentProfile || !game || !pokemonPair) {
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
                        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Pokemon Pair</h1>
                        <p className="text-muted-foreground">
                            {pokemonPair.pokemon1_nickname || pokemonPair.pokemon1_name} &{" "}
                            {pokemonPair.pokemon2_nickname || pokemonPair.pokemon2_name}
                        </p>
                    </div>

                    {pokemonPair.is_dead ? (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-destructive">Pokemon Pair Deceased</CardTitle>
                                <CardDescription>This Pokemon pair has been marked as dead.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Update Nicknames</CardTitle>
                                    <CardDescription>Change the nicknames for your Pokemon pair.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateNicknames} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-2">
                                                <Label className="mb-2" htmlFor="pokemon1Nickname">{pokemonPair.pokemon1_name} Nickname</Label>
                                                <Input
                                                    id="pokemon1Nickname"
                                                    type="text"
                                                    placeholder="Enter nickname..."
                                                    value={pokemon1Nickname}
                                                    onChange={(e) => setPokemon1Nickname(e.target.value)}
                                                />
                                            </div>
                                            <div className="p-2">
                                                <Label className="mb-2" htmlFor="pokemon2Nickname">{pokemonPair.pokemon2_name} Nickname</Label>
                                                <Input
                                                    id="pokemon2Nickname"
                                                    type="text"
                                                    placeholder="Enter nickname..."
                                                    value={pokemon2Nickname}
                                                    onChange={(e) => setPokemon2Nickname(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                                        <Button type="submit" disabled={isLoading} className="w-full">
                                            {isLoading ? "Updating..." : "Update Nicknames"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-destructive">Mark as Dead</CardTitle>
                                    <CardDescription>
                                        If this Pokemon pair has died, mark them as deceased. This action cannot be undone.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!showDeathForm ? (
                                        <Button variant="destructive" onClick={() => setShowDeathForm(true)} className="w-full">
                                            Mark Pokemon Pair as Dead
                                        </Button>
                                    ) : (
                                        <form onSubmit={handleMarkAsDead} className="space-y-4">
                                            <div className="p-2">
                                                <Label className="mb-2" htmlFor="responsiblePlayer">Who was responsible?</Label>
                                                <Select value={responsiblePlayer} onValueChange={setResponsiblePlayer} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select responsible player" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={game.player1_id}>{game.player1.username}</SelectItem>
                                                        <SelectItem value={game.player2_id}>{game.player2.username}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="p-4 bg-destructive/10 rounded-lg">
                                                <p className="text-sm text-destructive font-medium">
                                                    Warning: This will permanently mark both Pokemon as dead and cannot be undone.
                                                </p>
                                            </div>

                                            <div className="flex space-x-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowDeathForm(false)}
                                                    className="flex-1"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={isLoading || !responsiblePlayer}
                                                    className="flex-1"
                                                >
                                                    {isLoading ? "Marking as Dead..." : "Confirm Death"}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <div className="mt-6">
                        <Button variant="outline" onClick={() => router.push(`/games/${gameId}`)} className="w-full">
                            Back to Game
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
