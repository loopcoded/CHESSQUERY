"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { fetchUserProfile, fetchUserGames, calculatePlayerStats, formatGameData } from "@/lib/lichess-api"
import { PlayerSummarySkeleton, GameTableSkeleton } from "@/components/skeleton-components"
import { ErrorState } from "@/components/error-state"
import { GameDetailModal } from "@/components/game-detail-modal"
import { OpeningStats } from "@/components/opening-stats"

export default function ChessDashboard() {
  const [searchUsername, setSearchUsername] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [playerStats, setPlayerStats] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filterResult, setFilterResult] = useState("all")
  const [filterColor, setFilterColor] = useState("all")
  const [filterTimeControl, setFilterTimeControl] = useState("all")
  const [openingSearch, setOpeningSearch] = useState("")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [selectedGame, setSelectedGame] = useState(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)

  const filteredAndSortedGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesResult = filterResult === "all" || game.result === filterResult
      const matchesColor = filterColor === "all" || game.color === filterColor
      const matchesTimeControl = filterTimeControl === "all" || game.timeControl === filterTimeControl
      const matchesOpening =
        openingSearch === "" ||
        game.opening.toLowerCase().includes(openingSearch.toLowerCase()) ||
        game.eco.toLowerCase().includes(openingSearch.toLowerCase())

      return matchesResult && matchesColor && matchesTimeControl && matchesOpening
    })

    return filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === "date") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (sortField === "opponentRating") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [games, sortField, sortDirection, filterResult, filterColor, filterTimeControl, openingSearch])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    setError("")
    setPlayerStats(null)
    setGames([])

    try {
      console.log("[v0] Fetching data for username:", searchUsername)

      console.log("[v0] Starting API calls...")
      const [profile, userGames] = await Promise.all([
        fetchUserProfile(searchUsername.trim()),
        fetchUserGames(searchUsername.trim(), 50),
      ])

      console.log("[v0] Profile fetched:", profile?.id || "No profile")
      console.log("[v0] Games fetched:", userGames?.length || 0)

      if (!userGames || userGames.length === 0) {
        console.log("[v0] No games found for user")
        setError(
          `No games found for user "${searchUsername.trim()}". Make sure the username is correct and the player has played games.`,
        )
        return
      }

      const stats = calculatePlayerStats(userGames, searchUsername.trim())
      const formattedGames = formatGameData(userGames, searchUsername.trim())

      setCurrentUser(searchUsername.trim())
      setPlayerStats(stats)
      setGames(formattedGames)

      console.log("[v0] Stats calculated:", stats)
      console.log("[v0] Games formatted:", formattedGames.length)
    } catch (err) {
      console.error("[v0] Error fetching data:", err)

      let errorMessage = err.message
      if (err.message.includes("Failed to fetch user games")) {
        errorMessage = `Unable to fetch games for "${searchUsername.trim()}". This could be due to:\n• Username doesn't exist on Lichess\n• User has no public games\n• Lichess API is temporarily unavailable\n\nPlease check the username and try again.`
      } else if (err.message.includes("User not found")) {
        errorMessage = `User "${searchUsername.trim()}" not found on Lichess. Please check the spelling and try again.`
      }

      setError(errorMessage)
      setPlayerStats(null)
      setGames([])
      setCurrentUser("")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (currentUser || searchUsername.trim()) {
      handleSearch()
    }
  }

  const handleClear = () => {
    setSearchUsername("")
    setCurrentUser("")
    setPlayerStats(null)
    setGames([])
    setError("")
    setFilterResult("all")
    setFilterColor("all")
    setFilterTimeControl("all")
    setOpeningSearch("")
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

  const handleGameClick = (game) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
  }

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
    setSelectedGame(null)
  }

  return (
    <div
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: "url(/images/chess-motivation-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background overlay for better content readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

      {/* Main content with relative positioning to appear above overlay */}
      <div className="relative z-10">
        <nav className="border-b border-white/10 bg-transparent backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">CHESSQUERY</h1>
              </div>
              <div className="flex items-center space-x-4 max-w-md w-full">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Enter Lichess username"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pr-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70"
                    onKeyPress={(e) => e.key === "Enter" && !loading && handleSearch()}
                    disabled={loading}
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                {(currentUser || playerStats) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && !loading && (
            <div className="mb-6">
              <ErrorState error={error} onRetry={handleRetry} username={currentUser || searchUsername} />
            </div>
          )}

          {currentUser && !error && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">        
                  Showing results for: <span className="text-white">{currentUser}</span>
              </h2>
            </div>
          )}

          {loading && (
            <>
              <PlayerSummarySkeleton />
              <GameTableSkeleton />
            </>
          )}

          {playerStats && !loading && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 caret-blue-50">Player Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{playerStats.totalGames.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Wins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{playerStats.wins}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Losses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{playerStats.losses}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Draws</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{playerStats.draws}</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">White Win %</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{playerStats.whiteWinPercentage}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Black Win %</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{playerStats.blackWinPercentage}%</div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Most Played Opening</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {playerStats.mostPlayedOpening.eco} - {playerStats.mostPlayedOpening.name}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Opening Statistics Section */}
          {games.length > 0 && !loading && <OpeningStats games={games} username={currentUser} />}

          {/* Games Table Section */}
          {games.length > 0 && !loading && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 caret-blue-50">Recent Games ({games.length})</h2>

              <div className="mb-6 flex flex-wrap gap-4">
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger className="w-32 bg-background/90 backdrop-blur-sm">
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="Win">Win</SelectItem>
                    <SelectItem value="Loss">Loss</SelectItem>
                    <SelectItem value="Draw">Draw</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterColor} onValueChange={setFilterColor}>
                  <SelectTrigger className="w-32 bg-background/90 backdrop-blur-sm">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Black">Black</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterTimeControl} onValueChange={setFilterTimeControl}>
                  <SelectTrigger className="w-40 bg-background/90 backdrop-blur-sm">
                    <SelectValue placeholder="Time Control" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time Controls</SelectItem>
                    <SelectItem value="3+2">3+2</SelectItem>
                    <SelectItem value="5+3">5+3</SelectItem>
                    <SelectItem value="10+0">10+0</SelectItem>
                    <SelectItem value="15+10">15+10</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search openings or ECO codes..."
                  value={openingSearch}
                  onChange={(e) => setOpeningSearch(e.target.value)}
                  className="w-64 bg-background/90 backdrop-blur-sm"
                />
              </div>

              {filteredAndSortedGames.length !== games.length && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedGames.length} of {games.length} games
                  </p>
                </div>
              )}

              <Card className="bg-card/90 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("date")}
                          >
                            Date
                            {sortField === "date" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </Button>
                        </th>
                        <th className="text-left p-4 font-semibold">Opponent</th>
                        <th className="text-left p-4">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("opponentRating")}
                          >
                            Rating
                            {sortField === "opponentRating" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </Button>
                        </th>
                        <th className="text-left p-4">
                          <Button
                            variant="ghost"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort("result")}
                          >
                            Result
                            {sortField === "result" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                          </Button>
                        </th>
                        <th className="text-left p-4 font-semibold">Color</th>
                        <th className="text-left p-4 font-semibold">Time Control</th>
                        <th className="text-left p-4 font-semibold">Opening</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedGames.map((game) => (
                        <tr
                          key={game.id}
                          className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleGameClick(game)}
                        >
                          <td className="p-4">{new Date(game.date).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{game.opponent}</td>
                          <td className="p-4">{game.opponentRating}</td>
                          <td className="p-4">
                            <Badge variant={getResultBadgeVariant(game.result)}>{game.result}</Badge>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                game.color === "White" ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-100"
                              }`}
                            >
                              {game.color}
                            </span>
                          </td>
                          <td className="p-4">{game.timeControl}</td>
                          <td className="p-4">{game.opening}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {filteredAndSortedGames.length === 0 && games.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No games match your current filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-background/90 backdrop-blur-sm"
                    onClick={() => {
                      setFilterResult("all")
                      setFilterColor("all")
                      setFilterTimeControl("all")
                      setOpeningSearch("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {!loading && !playerStats && !error && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Search for a Lichess Player</h3>
              <p className="text-muted-foreground mb-4">
                Enter a Lichess username above to view their chess statistics and recent games.
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching for popular players like "hikaru", "magnuscarlsen", or "gothamchess"
              </p>
            </div>
          )}
        </div>
      </div>

      <GameDetailModal game={selectedGame} isOpen={isGameModalOpen} onClose={handleCloseGameModal} />
    </div>
  )
}
