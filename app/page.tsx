"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { getPlayerCount } from "./actions/get-player-count"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function HomePage() {
    const [playerCount, setPlayerCount] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuthAndFetchCount = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push("/dashboard")
                return
            }

            const count = await getPlayerCount()
            setPlayerCount(count)
            setIsLoading(false)
        }

        checkAuthAndFetchCount()
    }, [router])

    if (isLoading || playerCount === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">Pokemon Soul Link</h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Track your Pokemon Soul Link adventures with friends. Monitor deaths, analyze statistics, and see who&apos;s
                        the better trainer.
                    </p>
                    <p>
                        Join {playerCount.toLocaleString()} trainers already playing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl text-primary">What is Soul Link?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                                Soul Link is a Pokemon challenge where two players link their Pokemon together. If one Pokemon faints,
                                both linked Pokemon are considered dead. It&apos;s the ultimate test of teamwork and strategy.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl text-primary">Track Everything</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                                Monitor your soul link pairs, track deaths, see who&apos;s responsible for losses, and get detailed
                                analytics on your Pokemon journey together.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <Button asChild size="lg" className="text-lg px-8 flex-1">
                            <Link href="/auth/sign-up">Start Your Journey</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 flex-1 bg-transparent">
                            <Link href="/auth/login">Login</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
