"use server"

import { createClient } from "@/lib/supabase/server"

export async function getPlayerCount() {
    const supabase = await createClient()

    const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    if (error) {
        console.error("Error fetching player count:", error)
        return 0
    }

    return count || 0
}