import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
    title: "Pokemon Soul Link Tracker",
    description: "Track your Pokemon Soul Link adventures with friends",
    icons: {
        icon: "./favicon.ico"
    },
    alternates: {
        canonical: "https://pokemon-soul-link.vercel.app/",
    },
    authors: [{ name: "Siddharth Jain", url: "https://www.sidojain.dev" }],
    creator: "Siddharth Jain",
    publisher: "Siddharth Jain",
    keywords: ["Siddharth Jain", "Sido Jain", "sidojain", "pokemon", "soul link", "nuzlock", "Full Stack", "Open Source"],
    robots: "index,follow"
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <Suspense fallback={null}>{children}</Suspense>
                </ThemeProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
