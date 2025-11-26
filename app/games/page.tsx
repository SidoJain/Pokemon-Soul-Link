import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReloadButton } from "@/components/reload-button"
import Link from "next/link"

export default async function GamesPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    const { data: games } = await supabase
        .from("soul_link_games")
        .select(`
            *,
            player1:profiles!soul_link_games_player1_id_fkey(username),
            player2:profiles!soul_link_games_player2_id_fkey(username)
        `)
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={profile?.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Your Games</h1>
                            <ReloadButton />
                        </div>
                        <p className="text-muted-foreground">Manage your soul link adventures</p>
                    </div>
                    <Button asChild>
                        <Link href="/games/create">Create New Game</Link>
                    </Button>
                </div>

                {games && games.length > 0 ? (
                    <div className="grid gap-6">
                        {games.map((game) => {
                            const isPlayer1 = game.player1_id === user.id
                            const opponent = isPlayer1 ? game.player2 : game.player1

                            return (
                                <Card key={game.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-xl">{game.name}</CardTitle>
                                                <CardDescription>
                                                    vs {opponent?.username} • Created {new Date(game.created_at).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Button asChild size="sm">
                                                    <Link href={`/games/${game.id}`}>View Game</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <h3 className="text-lg font-medium mb-2">No games yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Start your first soul link adventure by creating a game with another trainer.
                            </p>
                            <Button asChild>
                                <Link href="/games/create">Create Your First Game</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
