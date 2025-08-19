// Lichess API utility functions
const LICHESS_API_BASE = "https://lichess.org/api"

export async function fetchUserProfile(username) {
  try {
    const response = await fetch(`${LICHESS_API_BASE}/user/${username}`)
    if (!response.ok) {
      throw new Error(`User not found: ${username}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }
}

export async function fetchUserGames(username, max = 50) {
  try {
    const response = await fetch(
      `${LICHESS_API_BASE}/games/user/${username}?max=${max}&rated=true&perfType=blitz,rapid,classical&opening=true&moves=false&pgnInJson=true&sort=dateDesc`,
      {
        headers: {
          Accept: "application/x-ndjson",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch games for user: ${username}`)
    }

    const text = await response.text()

    if (!text.trim()) {
      return []
    }

    const games = text
      .trim()
      .split("\n")
      .filter((line) => line.trim()) // Filter out empty lines
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch (parseError) {
          console.error("[v0] Failed to parse game line:", line, parseError)
          return null
        }
      })
      .filter((game) => game !== null) // Remove failed parses

    return games
  } catch (error) {
    console.error("[v0] Lichess API Error:", error)
    throw new Error(`Failed to fetch user games: ${error.message}`)
  }
}

export function calculatePlayerStats(games, username) {
  if (!games || games.length === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      whiteWinPercentage: 0,
      blackWinPercentage: 0,
      mostPlayedOpening: { eco: "N/A", name: "No games found" },
    }
  }

  let wins = 0,
    losses = 0,
    draws = 0
  let whiteWins = 0,
    whiteGames = 0,
    blackWins = 0,
    blackGames = 0
  const openings = {}

  games.forEach((game) => {
    const isWhite = game.players.white.user?.id.toLowerCase() === username.toLowerCase()
    const result =
      game.status === "draw"
        ? "draw"
        : (game.winner === "white" && isWhite) || (game.winner === "black" && !isWhite)
          ? "win"
          : "loss"

    if (result === "win") wins++
    else if (result === "loss") losses++
    else draws++

    if (isWhite) {
      whiteGames++
      if (result === "win") whiteWins++
    } else {
      blackGames++
      if (result === "win") blackWins++
    }

    // Track openings
    if (game.opening) {
      const openingKey = `${game.opening.eco} - ${game.opening.name}`
      openings[openingKey] = (openings[openingKey] || 0) + 1
    }
  })

  // Find most played opening
  const mostPlayedOpening = Object.entries(openings).reduce(
    (max, [opening, count]) => (count > max.count ? { opening, count } : max),
    { opening: "N/A - No openings found", count: 0 },
  )

  const [eco, name] = mostPlayedOpening.opening.split(" - ")

  return {
    totalGames: games.length,
    wins,
    losses,
    draws,
    whiteWinPercentage: whiteGames > 0 ? Math.round((whiteWins / whiteGames) * 100 * 10) / 10 : 0,
    blackWinPercentage: blackGames > 0 ? Math.round((blackWins / blackGames) * 100 * 10) / 10 : 0,
    mostPlayedOpening: { eco: eco || "N/A", name: name || "No openings found" },
  }
}

export function formatGameData(games, username) {
  return games.map((game, index) => {
    const isWhite = game.players.white.user?.id.toLowerCase() === username.toLowerCase()
    const opponent = isWhite ? game.players.black : game.players.white
    const result =
      game.status === "draw"
        ? "Draw"
        : (game.winner === "white" && isWhite) || (game.winner === "black" && !isWhite)
          ? "Win"
          : "Loss"

    return {
      id: game.id || index,
      date: new Date(game.createdAt).toISOString().split("T")[0],
      opponent: opponent.user?.id || "Anonymous",
      opponentRating: opponent.rating || "Unrated",
      result,
      color: isWhite ? "White" : "Black",
      timeControl: `${Math.floor(game.clock?.initial / 60)}+${game.clock?.increment || 0}`,
      opening: game.opening ? `${game.opening.eco} - ${game.opening.name}` : "Unknown",
      eco: game.opening?.eco || "",
      gameUrl: `https://lichess.org/${game.id}`,
      pgn: game.pgn || "",
    }
  })
}
