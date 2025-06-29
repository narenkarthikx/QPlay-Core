# Quantum Quest (QPlay-Core)

Quantum Quest is a full-stack quantum-themed gaming platform. This repository contains both the frontend (React + Vite) and backend (Flask + Supabase) code.

---

## Project Structure

```
QPlay-Core/
│
├── backend/                  # Python Flask backend
│   └── production_server.py  # Main Flask server (Supabase integration)
│   └── requirements.txt      # Python dependencies
│
├── src/                      # Frontend source code (React + Vite)
│   ├── App.tsx               # Main React app
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles (quantum theme)
│   ├── components/           # All UI and game components
│   │   ├── Achievements.tsx
│   │   ├── GameController.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── MainMenu.tsx
│   │   ├── QuantumGuide.tsx
│   │   ├── RoomSelector.tsx
│   │   ├── Settings.tsx
│   │   ├── auth/AuthModal.tsx
│   │   ├── rooms/            # Individual quantum game rooms
│   │   │   ├── EntanglementBridge.tsx
│   │   │   ├── ProbabilityBay.tsx
│   │   │   ├── QuantumArchive.tsx
│   │   │   ├── StateChambrer.tsx
│   │   │   ├── SuperpositionTower.tsx
│   │   │   ├── TunnelingVault.tsx
│   │   └── ui/               # UI primitives (Button, ThemeProvider)
│   ├── contexts/             # React Contexts (Auth, Game, Settings)
│   ├── services/             # API service for backend communication
│   ├── types/                # TypeScript types
│   └── README.md             # Frontend-specific docs
│
├── .env                      # Environment variables (not tracked)
├── .gitignore                # Git ignore rules
├── index.html                # Main HTML entry
├── vite.config.ts            # Vite config (ignored)
└── README.md                 # This file
```

---

## Frontend (React + Vite)
- **Modern React** with TypeScript
- **Quantum-themed UI**: Custom components for game rooms, leaderboards, achievements, and more
- **Contexts**: Auth, Game, and Settings contexts for state management
- **API Service**: Communicates with Flask backend and Supabase
- **Room Components**: Each quantum game room is a separate React component
- **Styling**: index.css for global styles, ThemeProvider for dark/light mode

## Backend (Flask + Supabase)
- **Flask server** (`backend/production_server.py`)
- **CORS enabled** for frontend-backend communication
- **Supabase integration**: Reads credentials from `.env` (not tracked)
- **Health endpoints**: `/` and `/health` for status checks
- **Ready for extension**: Add your own endpoints for game logic, user management, etc.

## Getting Started

### 1. Install Frontend Dependencies
```sh
npm install
```

### 2. Install Backend Dependencies
```sh
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the backend directory with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### 4. Run the Backend
```sh
cd backend
python production_server.py
```

### 5. Run the Frontend
```sh
npm run dev
```

---

## Development Timeline (June 24–29, 2025)
- **Core types, contexts, and UI primitives**
- **Game rooms and main features**
- **API integration and styling**
- **Final integration and documentation**

---

## Next Steps
- Continue backend development: add endpoints for game logic, user management, etc.
- Connect frontend to backend endpoints
- Polish UI/UX and add more quantum games!

---

## License
MIT
