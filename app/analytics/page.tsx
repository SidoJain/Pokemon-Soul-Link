import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeathChart } from "@/components/death-chart"

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect("/auth/login")
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    const { data: games } = await supabase
        .from("soul_link_games")
        .select(`
            *,
            player1:profiles!soul_link_games_player1_id_fkey(username),
            player2:profiles!soul_link_games_player2_id_fkey(username)
        `)
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)

    // Get all death statistics for user's games
    const gameIds = games?.map((game) => game.id) || []
    const { data: allDeathStats } = await supabase
        .from("death_statistics")
        .select(`
            *,
            player:profiles(username),
            game:soul_link_games(name)
        `)
        .in("game_id", gameIds)

    // Calculate user's statistics
    const userStats = allDeathStats?.filter((stat) => stat.player_id === user.id) || []
    const totalUserDeaths = userStats.reduce((sum, stat) => sum + stat.death_count, 0)

    // Calculate opponent statistics
    const opponentStats = allDeathStats?.filter((stat) => stat.player_id !== user.id) || []
    const totalOpponentDeaths = opponentStats.reduce((sum, stat) => sum + stat.death_count, 0)

    // Prepare chart data
    const chartData = games?.map((game) => {
        const userDeathsInGame = allDeathStats?.find((stat) => stat.game_id === game.id && stat.player_id === user.id)?.death_count || 0
        const opponentId = game.player1_id === user.id ? game.player2_id : game.player1_id
        const opponentDeathsInGame = allDeathStats?.find((stat) => stat.game_id === game.id && stat.player_id === opponentId)?.death_count || 0
        const opponentName = game.player1_id === user.id ? game.player2?.username : game.player1?.username

        return {
            game: game.name,
            userDeaths: userDeathsInGame,
            opponentDeaths: opponentDeathsInGame,
            opponent: opponentName,
        }
    }) || []

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={profile?.username} />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Death Analytics</h1>
                    <p className="text-muted-foreground">Analyze your Pokemon Soul Link performance and statistics.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Your Deaths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-destructive">{totalUserDeaths}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Opponent Deaths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{totalOpponentDeaths}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-1 gap-6 mb-8">
                    <DeathChart data={chartData} />
                </div>

                <div className="grid md:grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Game Performance</CardTitle>
                            <CardDescription>Deaths per game comparison</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {games && games.length > 0 ? (
                                <div className="space-y-4">
                                    {games.map((game) => {
                                        const userDeathsInGame = allDeathStats?.find((stat) => stat.game_id === game.id && stat.player_id === user.id)?.death_count || 0
                                        const opponentId = game.player1_id === user.id ? game.player2_id : game.player1_id
                                        const opponentDeathsInGame = allDeathStats?.find((stat) => stat.game_id === game.id && stat.player_id === opponentId)?.death_count || 0
                                        const opponentName = game.player1_id === user.id ? game.player2?.username : game.player1?.username

                                        return (
                                            <div key={game.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{game.name}</h3>
                                                        <p className="text-sm text-muted-foreground">vs {opponentName}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm">
                                                            <span className="text-destructive">{userDeathsInGame}</span> -{" "}
                                                            <span className="text-primary">{opponentDeathsInGame}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {userDeathsInGame < opponentDeathsInGame
                                                                ? "Winning"
                                                                : userDeathsInGame > opponentDeathsInGame
                                                                    ? "Losing"
                                                                    : "Tied"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No games yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
