"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

interface NavigationProps {
    username?: string
}

export function Navigation({ username }: NavigationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        setIsLoading(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/")
        setIsLoading(false)
    }

    return (
        <nav className="border-b bg-card sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-primary">
                            Pokemon Soul Link
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/games" className="text-foreground hover:text-primary transition-colors">
                                Games
                            </Link>
                            <Link href="/find-player" className="text-foreground hover:text-primary transition-colors">
                                Find Player
                            </Link>
                            <Link href="/requests" className="text-foreground hover:text-primary transition-colors">
                                Requests
                            </Link>
                            <Link href="/analytics" className="text-foreground hover:text-primary transition-colors">
                                Analytics
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {username && (
                            <span className="hidden sm:block text-sm text-muted-foreground">
                                Welcome, <Link href="/profile" className="text-foreground hover:text-primary transition-colors">{username}</Link>
                            </span>
                        )}
                        <ThemeToggle />
                        <div className="hidden md:block">
                            <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
                                {isLoading ? "Signing out..." : "Sign Out"}
                            </Button>
                        </div>
                        <MobileNav username={username} onSignOut={handleSignOut} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </nav>
    )
}
