"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function ReloadButton() {
    const handleReload = () => {
        window.location.reload()
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={handleReload}
            className="ml-auto p-1"
            aria-label="Reload games"
        >
            <RefreshCw className="w-5 h-5" />
        </Button>
    )
}
