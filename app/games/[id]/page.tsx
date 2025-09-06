import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface GamePageProps {
    params: {
        id: string
    }
}

export default async function GamePage({ params }: GamePageProps) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    const { data: game } = await supabase
        .from("soul_link_games")
        .select(`
            *,
            player1:profiles!soul_link_games_player1_id_fkey(username),
            player2:profiles!soul_link_games_player2_id_fkey(username)
        `)
        .eq("id", params.id)
        .single()
    if (!game) {
        redirect("/games")
    }

    // Check if user is part of this game
    if (game.player1_id !== user.id && game.player2_id !== user.id) {
        redirect("/games")
    }

    // Get Pokemon pairs for this game
    const { data: pokemonPairs } = await supabase
        .from("pokemon_pairs")
        .select(`
            *,
            responsible_player:profiles(username)
        `)
        .eq("game_id", params.id)
        .order("created_at", { ascending: false })

    // Get death statistics
    const { data: deathStats } = await supabase
        .from("death_statistics")
        .select(`
            *,
            player:profiles(username)
        `)
        .eq("game_id", params.id)

    const isPlayer1 = game.player1_id === user.id
    const opponent = isPlayer1 ? game.player2 : game.player1
    const currentPlayerStats = deathStats?.find((stat) => stat.player_id === user.id)
    const opponentStats = deathStats?.find((stat) => stat.player_id === (isPlayer1 ? game.player2_id : game.player1_id))

    const alivePairs = pokemonPairs?.filter((pair) => !pair.is_dead) || []
    const deadPairs = pokemonPairs?.filter((pair) => pair.is_dead) || []

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={profile?.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="max-w-[50%]">
                            <h1 className="text-3xl font-bold text-foreground mb-2 break-all">{game.name}</h1>
                            <p className="text-muted-foreground">
                                {profile?.username} vs {opponent?.username}
                            </p>
                        </div>
                        <div className="grid gap-4 grid-cols-1">
                            <Button asChild variant="outline">
                                <Link href="/games">Back to Games</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/games/${params.id}/add-pokemon`}>Add Pokemon Pair</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Deaths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-destructive">{currentPlayerStats?.death_count || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{opponent?.username}&apos;s Deaths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-destructive">{opponentStats?.death_count || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Active Pairs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{alivePairs.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-600">Active Pokemon Pairs</CardTitle>
                            <CardDescription>Currently linked Pokemon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {alivePairs.length > 0 ? (
                                <div className="space-y-4 max-h-36 overflow-y-scroll">
                                    {alivePairs.map((pair) => (
                                        <div key={pair.id} className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">
                                                        {pair.pokemon1_nickname || pair.pokemon1_name} &{" "}
                                                        {pair.pokemon2_nickname || pair.pokemon2_name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {pair.pokemon1_name} & {pair.pokemon2_name}
                                                    </p>
                                                </div>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/games/${params.id}/pokemon/${pair.id}`}>Manage</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No active Pokemon pairs</p>
                                    <Button asChild size="sm">
                                        <Link href={`/games/${params.id}/add-pokemon`}>Add New Pair</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">Fallen Pokemon</CardTitle>
                            <CardDescription>Pokemon that have been lost</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deadPairs.length > 0 ? (
                                <div className="space-y-4 max-h-36 overflow-y-scroll">
                                    {deadPairs.map((pair) => (
                                        <div key={pair.id} className="p-4 border rounded-lg bg-muted/50">
                                            <div>
                                                <h3 className="font-medium text-muted-foreground">
                                                    {pair.pokemon1_nickname || pair.pokemon1_name} &{" "}
                                                    {pair.pokemon2_nickname || pair.pokemon2_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {pair.pokemon1_name} & {pair.pokemon2_name}
                                                </p>
                                                {pair.responsible_player && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Responsible: {pair.responsible_player.username}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No Pokemon lost yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
