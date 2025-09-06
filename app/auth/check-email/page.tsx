import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckEmailPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-primary">Pokemon Soul Link</h1>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Check your email</CardTitle>
                            <CardDescription>We&apos;ve sent you a confirmation link to complete your registration.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Please check your email and click the confirmation link to activate your account.
                                </p>
                                <Button asChild className="w-full">
                                    <Link href="/auth/login">Back to Login</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
