#!/usr/bin/env python3
"""
Production Flask Backend Server for Quantum Quest
Uses HTTP requests to Supabase for better compatibility
"""
from flask import Flask, jsonify
from flask_cors import CORS
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
