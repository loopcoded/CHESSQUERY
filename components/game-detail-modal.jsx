"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Clock, Calendar, User, Target, BookOpen, TrendingUp } from "lucide-react"

export function GameDetailModal({ game, isOpen, onClose }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!game) return null

  const getResultColor = (result) => {
    switch (result) {
      case "Win":
        return "text-green-600"
      case "Loss":
        return "text-red-600"
      case "Draw":
        return "text-yellow-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getResultBadgeVariant = (result) => {
    switch (result) {
      case "Win":
        return "default"
      case "Loss":
        return "destructive"
      case "Draw":
        return "secondary"
      default:
        return "outline"
    }
  }

  const parsePgnToMoves = (pgn) => {
  return pgn
    .replace(/\d+\./g, "")
    .trim()
    .split(/\s+/)
}


const handleLastMatchAnalysis = async () => {
  console.log("Button clicked")
  if (!game?.pgn) return
  setLoading(true)
  try {
    const moves = parsePgnToMoves(game.pgn)
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),  // <-- send moves array
    })
    const data = await res.json()
    console.log("Stockfish response:", data) // <-- check this

    const normalized = {
      evalTrend: data.eval_trend || [],
      mistakes: [...(data.mistakes || []), ...(data.blunders || [])].map((m) => ({
        ...m,
        type: (data.blunders || []).includes(m) ? "blunder" : "mistake",
        evalBefore: m.eval - m.delta,
        evalAfter: m.eval,
      })),
    }

    console.log("Normalized analysis:", normalized) // <-- check this
    setAnalysis(normalized)
  } catch (err) {
    console.error("Error fetching analysis:", err)
  } finally {
    setLoading(false)
  }
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Game Analysis</span>
            <Badge variant={getResultBadgeVariant(game.result)}>{game.result}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Game Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Opponent:</span>
                <span className="font-mono">{game.opponent}</span>
                <span className="text-muted-foreground">({game.opponentRating})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Playing as:</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    game.color === "White" ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {game.color}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time Control:</span>
                <span>{game.timeControl}</span>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Result:</span>
                <span className={`font-semibold ${getResultColor(game.result)}`}>{game.result}</span>
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={() => window.open(game.gameUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                View on Lichess
              </Button>

              {/* Last Match Analysis Button */}
              <Button
                variant="default"
                className="w-full mt-4"
                onClick={handleLastMatchAnalysis}
              >
                Analyze Last Match
              </Button>
            </CardContent>
          </Card>

          {/* Stockfish Analysis */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Stockfish Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && <p className="text-center text-muted-foreground">Analyzing game with Stockfish...</p>}

              {!loading && analysis && (
                <>
                  {/* Mistakes & Blunders */}
                  <div>
                    <h4 className="font-semibold mb-3">Mistakes & Blunders</h4>
                    {analysis.mistakes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No major mistakes detected ✅</p>
                    ) : (
                      <ul className="space-y-2">
                        {analysis.mistakes.map((m, idx) => (
                          <li key={idx} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                            <span className="font-mono text-sm">{m.move}</span>
                            <Badge variant={m.type === "blunder" ? "destructive" : "secondary"}>{m.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Eval change: {m.evalBefore} → {m.evalAfter}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Evaluation Trend */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Evaluation Trend
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.evalTrend.map((val, idx) => (
                        <Badge key={idx} variant="outline" className="font-mono">
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
