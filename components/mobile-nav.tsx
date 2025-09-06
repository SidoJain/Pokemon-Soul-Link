"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface MobileNavProps {
    username?: string
    onSignOut: () => void
    isLoading: boolean
}

export function MobileNav({ username, onSignOut, isLoading }: MobileNavProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                    <Link
                        href="/dashboard"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setOpen(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/games"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setOpen(false)}
                    >
                        Games
                    </Link>
                    <Link
                        href="/find-player"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setOpen(false)}
                    >
                        Find Player
                    </Link>
                    <Link
                        href="/requests"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setOpen(false)}
                    >
                        Requests
                    </Link>
                    <Link
                        href="/analytics"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setOpen(false)}
                    >
                        Analytics
                    </Link>
                    <div className="border-t pt-4">
                        {username && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Signed in as <Link href="/profile" className="text-foreground hover:text-primary transition-colors py-2">{username}</Link>
                            </p>
                        )}
                        <Button variant="outline" onClick={onSignOut} disabled={isLoading} className="w-full bg-transparent">
                            {isLoading ? "Signing out..." : "Sign Out"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
