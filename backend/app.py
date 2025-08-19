import asyncio
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import uvicorn
import os

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

# Allow requests from your frontend
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOCKFISH_PATH = r"D:\\stockfish-windows-x86-64-avx2\\stockfish\\stockfish-windows-x86-64-avx2.exe"
engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

class GameRequest(BaseModel):
    moves: list[str]

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
                # For lost games, flag small negative deltas as minor mistakes
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

@app.on_event("shutdown")
def shutdown_event():
    engine.quit()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  
    uvicorn.run(app, host="0.0.0.0", port=port)