import os
import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import uvicorn

# Fix asyncio on Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

# ---------- DYNAMIC CORS ----------
LOCAL_ORIGIN = "http://localhost:3000"
PROD_ORIGIN = os.environ.get("FRONTEND_URL", "https://your-frontend.vercel.app")
origins = [LOCAL_ORIGIN, PROD_ORIGIN]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- STOCKFISH SETUP ----------
# Determine OS-specific Stockfish binary
if sys.platform == "win32":
    STOCKFISH_PATH = os.path.join(os.path.dirname(__file__), "stockfish/stockfish-windows.exe")
else:  # Linux (Render)
    STOCKFISH_PATH = os.path.join(os.path.dirname(__file__), "stockfish/stockfish-linux")

# Ensure Linux binary is executable
if sys.platform != "win32":
    os.chmod(STOCKFISH_PATH, 0o755)

# Initialize engine
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

# ---------- API MODELS ----------
class GameRequest(BaseModel):
    moves: list[str]

# ---------- ANALYSIS ENDPOINT ----------
@app.post("/analyze")
async def analyze_game(req: GameRequest):
    board = chess.Board()
    eval_trend = []
    mistakes = []
    blunders = []

    for i, move in enumerate(req.moves):
        try:
            board.push_san(move)
        except Exception as e:
            return {"error": f"Invalid move {move}: {e}"}

        info = engine.analyse(board, chess.engine.Limit(depth=10))
        score = info["score"].white().score(mate_score=10000)  # centipawns
        eval_trend.append(score)

        if i > 0:
            delta = eval_trend[-1] - eval_trend[-2]
            mistake_type = None
            if abs(delta) >= 300:
                mistake_type = "blunder"
                blunders.append({
                    "ply": i + 1,
                    "move": move,
                    "eval": score,
                    "delta": delta,
                    "type": mistake_type
                })
            elif abs(delta) >= 150:
                mistake_type = "mistake"
                mistakes.append({
                    "ply": i + 1,
                    "move": move,
                    "eval": score,
                    "delta": delta,
                    "type": mistake_type
                })
            else:
                # minor mistakes
                if score < 0 and eval_trend[-2] > score:
                    mistake_type = "minor"
                    mistakes.append({
                        "ply": i + 1,
                        "move": move,
                        "eval": score,
                        "delta": delta,
                        "type": mistake_type
                    })

    return {
        "eval_trend": eval_trend,
        "mistakes": mistakes,
        "blunders": blunders
    }

# ---------- CLEANUP ----------
@app.on_event("shutdown")
def shutdown_event():
    engine.quit()

# ---------- START SERVER ----------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Render injects this
    uvicorn.run(app, host="0.0.0.0", port=port)
