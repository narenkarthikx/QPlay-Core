# Quantum Quest Backend

This is the backend server for Quantum Quest. It is built with Python (Flask) and connects to Supabase for saving users, scores, and game data.

## How to Run

1. Make sure you have Python 3 installed.
2. Install the required packages:
   ```sh
   pip install -r requirements.txt
   ```
3. Create a `.env` file in this folder with your Supabase info:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```
4. Start the server:
   ```sh
   python production_server.py
   ```

## What This Server Does
- Handles user signup and login
- Saves and loads game progress
- Manages leaderboards
- Talks to the frontend (the game you play)

## Where to Change Game Logic
- Most game logic is in the frontend (`src/` folder)
- Backend is for saving data and user accounts

## Need Help?
- Check the main README or ask a teammate!
