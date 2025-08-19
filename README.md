#CHESSQUERY

A sleek, interactive React-based chess dashboard that fetches a player’s recent games and statistics from [Lichess](https://lichess.org/) and provides detailed game analysis using Stockfish. Designed to help chess enthusiasts track their performance and identify improvement areas.

---

<img width="1725" height="862" alt="image" src="https://github.com/user-attachments/assets/8d39b0c0-4e0f-485d-aebc-bb1dbb86523d" />
---

## Features
<img width="1595" height="858" alt="image" src="https://github.com/user-attachments/assets/b32fdacf-d36c-4dc2-8f57-06c88802dbfa" />
- **Player Statistics:** Displays total games, wins, losses, draws, and win percentages for both colors.
<img width="1605" height="696" alt="image" src="https://github.com/user-attachments/assets/0c64fc42-fcd5-43c1-904d-9aad0087b2ee" />
- **Game Filtering & Sorting:** Filter games by result, color, time control, or opening; sort by date, opponent rating, or result.
<img width="1640" height="842" alt="image" src="https://github.com/user-attachments/assets/873cc8c9-9537-4203-aba9-4d19c7aad6a0" />
- **Recent Games Table:** Interactive table showing a player’s recent games with opponent, rating, result, color, time control, and opening.
- **Opening Statistics:** Visualize the most played openings and ECO codes.
- <img width="620" height="762" alt="image" src="https://github.com/user-attachments/assets/bf120048-8944-4590-b3da-ba4bf5646e12" />
- **Game Analysis:** Integrates with Stockfish engine to analyze moves, highlight mistakes and blunders, and show evaluation trends.
<img width="1082" height="146" alt="image" src="https://github.com/user-attachments/assets/84bb0e59-11ed-4dc3-b0de-1f9ce96c632f" />
- **Responsive UI:** Clean, mobile-friendly design with blurred background overlay for readability.
<img width="590" height="90" alt="image" src="https://github.com/user-attachments/assets/003ace7e-cfa5-4ec6-a87d-f214f504749f" />
- **Search & Clear:** Search by Lichess username, clear filters, and reset dashboard.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide React icons  
- **Backend:** FastAPI, Python  
- **Chess Engine:** Stockfish (UCI engine)  
- **Data Fetching:** Lichess API  

---
## Project Structure
```
frontend/
 ├─ components/         # React components (modals, skeletons, stats)
 ├─ lib/                # API calls & data formatting
 ├─ pages/              # Main dashboard page
backend/
 ├─ main.py             # FastAPI backend with Stockfish integration
public/
 ├─ images/             # Backgrounds & assets
