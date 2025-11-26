import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReloadButton } from "@/components/reload-button"
import Link from "next/link"

export default async function DashboardPage() {
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
        .limit(2)

    const { data: pendingRequests } = await supabase
        .from("game_requests")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("status", "pending")

    // Get death statistics
    const { data: deathStats } = await supabase.from("death_statistics").select("*").eq("player_id", user.id)
    const totalDeaths = deathStats?.reduce((sum, stat) => sum + stat.death_count, 0) || 0
    const pendingRequestsCount = pendingRequests?.length || 0

    return (
        <div className="min-h-screen bg-background">
            <Navigation username={profile?.username} />

            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back, {profile?.username}!</h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Manage your soul link games and track your Pokemon adventures.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base md:text-lg">Total Games</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold text-primary">{games?.length || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base md:text-lg">Deaths Caused</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-bold text-destructive">{totalDeaths}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Games</CardTitle>
                                <ReloadButton />
                            </div>
                            <CardDescription>Your latest soul link adventures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {games && games.length > 0 ? (
                                <div className="space-y-3 md:space-y-4">
                                    {games.slice(0, 3).map((game) => (
                                        <div
                                            key={game.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium truncate">{game.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    vs {game.player1_id === user.id ? game.player2?.username : game.player1?.username}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                                                <Button asChild size="sm" variant="outline" className="bg-transparent">
                                                    <Link href={`/games/${game.id}`}>View</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 md:py-8">
                                    <p className="text-muted-foreground mb-4">No games yet</p>
                                    <Button type="button" variant="default" asChild>
                                        <Link href="/find-player">Find a Player</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Get started with your soul link journey</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button variant="default" asChild className="w-full justify-start">
                                    <Link href="/find-player">
                                        <span className="mr-2">🔍</span>
                                        Find Player
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start bg-transparent hover:bg-orange-500">
                                    <Link href="/requests">
                                        <span className="mr-2">📬</span>
                                        Game Requests
                                        {pendingRequestsCount > 0 && (
                                            <Badge variant="secondary" className="ml-auto">
                                                {pendingRequestsCount}
                                            </Badge>
                                        )}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                                    <Link href="/profile">
                                        <span className="mr-2">👤</span>
                                        Edit Profile
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
