"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DeathChartProps {
    data: Array<{
        game: string
        userDeaths: number
        opponentDeaths: number
        opponent: string
    }>
}

export function DeathChart({ data }: DeathChartProps) {
    const totalUserDeaths = data.reduce((sum, game) => sum + game.userDeaths, 0)
    const totalOpponentDeaths = data.reduce((sum, game) => sum + game.opponentDeaths, 0)

    const pieData = (totalUserDeaths === 0 && totalOpponentDeaths === 0) ? [
        { name: "Total Deaths", value: 1, color: "" }
    ] : [
        { name: "Your Deaths", value: totalUserDeaths, color: "#dc2626" },
        { name: "Opponent Deaths", value: totalOpponentDeaths, color: "#2563eb" }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Deaths Overview</CardTitle>
                <CardDescription>Total deaths comparison across all games</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
