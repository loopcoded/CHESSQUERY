"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export function ErrorState({ error, onRetry, username }) {
  const getErrorMessage = (error) => {
    if (error.includes("User not found")) {
      return {
        title: "Player Not Found",
        description: `The Lichess user "${username}" could not be found. Please check the username and try again.`,
        suggestion: "Make sure the username is spelled correctly and exists on Lichess.",
      }
    }
    if (error.includes("Failed to fetch")) {
      return {
        title: "Connection Error",
        description: "Unable to connect to Lichess. Please check your internet connection.",
        suggestion: "Try again in a few moments or check if Lichess is accessible.",
      }
    }
    return {
      title: "Something Went Wrong",
      description: error,
      suggestion: "Please try again or contact support if the problem persists.",
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{errorInfo.title}</h3>
        <p className="text-muted-foreground mb-2">{errorInfo.description}</p>
        <p className="text-sm text-muted-foreground mb-6">{errorInfo.suggestion}</p>
        <Button onClick={onRetry} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
