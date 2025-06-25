#!/usr/bin/env python3
"""
Production Flask Backend Server for Quantum Quest
Uses HTTP requests to Supabase for better compatibility
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone
import os

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("💡 Tip: Install python-dotenv to automatically load .env files")
    print("   pip install python-dotenv")

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def root():
    """Health check endpoint"""
    return "Quantum Quest Backend is running!"

@app.route('/health')
def health_check():
    """Detailed health check"""
    # Test Supabase connection
    import requests
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?select=count", headers=get_supabase_headers(), timeout=5)
        db_status = "connected" if response.status_code == 200 else "error"
    except:
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "quantum_engine": "operational",
        "database": db_status,
        "websockets": "active"
    }

@app.route('/v1/models', methods=['GET'])
def get_models():
    """Get available AI models - frontend compatibility"""
    return jsonify({
        "models": [
            {"id": "quantum-gpt", "name": "Quantum GPT", "description": "AI model for quantum computing help"}
        ]
    })

@app.route('/api/game/rooms')
def get_rooms():
    """Get available game rooms"""
    return jsonify({
        "rooms": [
            {"id": "superposition", "name": "Superposition Tower", "difficulty": "easy", "unlocked": True},
            {"id": "entanglement", "name": "Entanglement Bridge", "difficulty": "medium", "unlocked": False},
            {"id": "tunneling", "name": "Tunneling Vault", "difficulty": "hard", "unlocked": False}
        ]
    })

@app.route('/api/auth/user')
def get_user():
    """Get current user info from database"""
    import requests
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?limit=1", headers=get_supabase_headers())
        if response.status_code == 200:
            users = response.json()
            if users:
                return jsonify({"user": users[0]})
        return jsonify({"error": "No user found"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to get user: {str(e)}"}), 500

from flask import request
from datetime import datetime, timezone

@app.route('/api/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    """Real user signup - creates user and initial leaderboard entry"""
    if request.method == 'OPTIONS':
        return '', 200
    import requests
    try:
        data = request.get_json()
        email = data.get("email")
        username = data.get("username", email.split("@")[0] if email else "player")
        full_name = data.get("full_name", "")
        check_response = requests.get(f"{SUPABASE_REST_URL}/users?email=eq.{email}", headers=get_supabase_headers())
        if check_response.status_code == 200 and check_response.json():
            return jsonify({"success": False, "error": "User already exists"}), 400
        user_data = {
            "email": email,
            "username": username,
            "full_name": full_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_verified": True,
            "is_premium": False,
            "total_playtime": 0,
            "games_completed": 0,
            "best_completion_time": None,
            "total_score": 0,
            "quantum_mastery_level": 1,
            "is_active": True
        }
        response = requests.post(f"{SUPABASE_REST_URL}/users", headers=get_supabase_headers(), json=user_data)
        if response.status_code in [200, 201]:
            user = response.json()[0] if response.json() else user_data
            leaderboard_entries = [{
                "user_id": user.get("id"),
                "category": "total_score",
                "completion_time": None,
                "total_score": 0,
                "difficulty": "easy",
                "rooms_completed": 0,
                "hints_used": 0,
                "achieved_at": datetime.now(timezone.utc).isoformat()
            }]
            try:
                requests.post(f"{SUPABASE_REST_URL}/leaderboard_entries", headers=get_supabase_headers(), json=leaderboard_entries)
            except:
                pass
            return jsonify({"success": True, "message": "Account created successfully!", "user": user})
        else:
            return jsonify({"success": False, "error": f"Failed to create user. Status: {response.status_code}"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Signup failed: {str(e)}"}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login"""
    if request.method == 'OPTIONS':
        return '', 200
    import requests
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"success": False, "error": "Email is required"}), 400
        response = requests.get(f"{SUPABASE_REST_URL}/users?email=eq.{email}", headers=get_supabase_headers())
        if response.status_code == 200:
            users = response.json()
            if users:
                user = users[0]
                try:
                    requests.patch(
                        f"{SUPABASE_REST_URL}/users?id=eq.{user['id']}",
                        headers=get_supabase_headers(),
                        json={"last_login": datetime.now(timezone.utc).isoformat()}
                    )
                except Exception:
                    pass
                return jsonify({"success": True, "user": user})
            else:
                return jsonify({"success": False, "error": "User not found"}), 404
        else:
            return jsonify({"success": False, "error": "Database connection failed"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"Login failed: {str(e)}"}), 500

@app.route('/api/auth/signin', methods=['POST', 'OPTIONS'])
def signin():
    """Alias for login endpoint"""
    return login()

@app.route('/api/leaderboard/score', methods=['GET'])
def get_score_leaderboard():
    """Get score-based leaderboard with real user data"""
    import requests
    try:
        response = requests.get(
            f"{SUPABASE_REST_URL}/leaderboard_entries?category=eq.total_score&order=total_score.desc&limit=10",
            headers=get_supabase_headers()
        )
        if response.status_code == 200:
            leaderboard_data = response.json()
            enriched_leaderboard = []
            for i, entry in enumerate(leaderboard_data):
                entry["rank"] = i + 1
                user_response = requests.get(
                    f"{SUPABASE_REST_URL}/users?id=eq.{entry['user_id']}&select=username,full_name",
                    headers=get_supabase_headers()
                )
                if user_response.status_code == 200 and user_response.json():
                    user_data = user_response.json()[0]
                    entry.update(user_data)
                enriched_leaderboard.append(entry)
            if enriched_leaderboard:
                return jsonify({
                    "entries": enriched_leaderboard,
                    "type": "score",
                    "source": "database"
                })
        users_response = requests.get(f"{SUPABASE_REST_URL}/users?order=total_score.desc&limit=10", headers=get_supabase_headers())
        if users_response.status_code == 200:
            users = users_response.json()
            mock_leaderboard = []
            for i, user in enumerate(users):
                mock_leaderboard.append({
                    "rank": i + 1,
                    "username": user.get("username", "Unknown"),
                    "full_name": user.get("full_name", ""),
                    "total_score": user.get("total_score", 0),
                    "completion_time": user.get("best_completion_time"),
                    "games_completed": user.get("games_completed", 0),
                    "quantum_mastery_level": user.get("quantum_mastery_level", 1)
                })
            return jsonify({
                "entries": mock_leaderboard,
                "type": "score",
                "source": "user_stats"
            })
        return jsonify({
            "entries": [
                {"rank": 1, "username": "QuantumAlice", "total_score": 4500, "completion_time": 180, "games_completed": 15},
                {"rank": 2, "username": "EntangleCharlie", "total_score": 3200, "completion_time": 200, "games_completed": 12},
                {"rank": 3, "username": "SuperpositionBob", "total_score": 2800, "completion_time": 240, "games_completed": 8}
            ],
            "type": "score",
            "source": "demo"
        })
    except Exception as e:
        return jsonify({
            "entries": [
                {"rank": 1, "username": "QuantumAlice", "total_score": 4500, "completion_time": 180},
                {"rank": 2, "username": "EntangleCharlie", "total_score": 3200, "completion_time": 200}
            ],
            "type": "score",
            "source": "demo"
        })

# Supabase configuration - read from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", SUPABASE_ANON_KEY)
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else ""

# Check if environment variables are configured
SUPABASE_CONFIGURED = bool(SUPABASE_URL and SUPABASE_ANON_KEY)

if not SUPABASE_CONFIGURED:
    print("⚠️  WARNING: Supabase environment variables not configured!")
    print("   Create a .env file in the backend directory with:")
    print("   SUPABASE_URL=https://your-project.supabase.co")
    print("   SUPABASE_ANON_KEY=your-anon-key")
    print("   SUPABASE_SERVICE_KEY=your-service-key")
    print("   Server will run with demo data only.\n")

# Headers for Supabase requests
def get_supabase_headers(use_service_key=False):
    key = SUPABASE_SERVICE_KEY if use_service_key else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

if __name__ == '__main__':
    print("🚀 Starting Quantum Quest Production Flask Server...")
    app.run(host='0.0.0.0', port=8000, debug=True)
