import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function OpeningStats({ games, username }) {
  if (!games || games.length === 0) return null

  // Calculate opening statistics
  const openingStats = {}

  games.forEach((game) => {
    const openingKey = game.eco
    const openingName = game.opening.split(" - ")[1] || game.opening

    if (!openingStats[openingKey]) {
      openingStats[openingKey] = {
        name: openingName,
        eco: openingKey,
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        asWhite: 0,
        asBlack: 0,
        whiteWins: 0,
        blackWins: 0,
      }
    }

    const stats = openingStats[openingKey]
    stats.total++

    if (game.result === "Win") stats.wins++
    else if (game.result === "Loss") stats.losses++
    else stats.draws++

    if (game.color === "White") {
      stats.asWhite++
      if (game.result === "Win") stats.whiteWins++
    } else {
      stats.asBlack++
      if (game.result === "Win") stats.blackWins++
    }
  })

  // Sort by frequency and get top 6
  const topOpenings = Object.values(openingStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const getWinRate = (wins, total) => {
    return total > 0 ? Math.round((wins / total) * 100) : 0
  }

  const getPerformanceColor = (winRate) => {
    if (winRate >= 60) return "text-green-600"
    if (winRate >= 45) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Opening Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topOpenings.map((opening) => {
            const winRate = getWinRate(opening.wins, opening.total)
            const whiteWinRate = getWinRate(opening.whiteWins, opening.asWhite)
            const blackWinRate = getWinRate(opening.blackWins, opening.asBlack)

            return (
              <div key={opening.eco} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono">
                    {opening.eco}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{opening.total} games</span>
                </div>

                <h4 className="font-semibold text-sm mb-3 line-clamp-2">{opening.name}</h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Win Rate</span>
                    <span className={`font-semibold ${getPerformanceColor(winRate)}`}>{winRate}%</span>
                  </div>
                  <Progress value={winRate} className="h-2" />

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block">As White</span>
                      <span className={`font-semibold ${getPerformanceColor(whiteWinRate)}`}>
                        {whiteWinRate}% ({opening.asWhite})
                      </span>
                    </div>
                    <div>
                      <span className="block">As Black</span>
                      <span className={`font-semibold ${getPerformanceColor(blackWinRate)}`}>
                        {blackWinRate}% ({opening.asBlack})
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">W: {opening.wins}</span>
                    <span className="text-red-600">L: {opening.losses}</span>
                    <span className="text-yellow-600">D: {opening.draws}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {topOpenings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No opening data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
