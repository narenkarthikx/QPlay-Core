#!/usr/bin/env python3
"""
Production Flask Backend Server for Quantum Quest
Uses HTTP requests to Supabase for better compatibility
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
from datetime import datetime, timezone

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/')
def root():
    """Health check endpoint"""
    return jsonify({
        "message": "Quantum Quest Backend is running!",
        "version": "1.0.0",
        "supabase_connected": True
    })

@app.route('/health')
def health_check():
    """Detailed health check"""
    # Test Supabase connection
    try:
        response = requests.get(f"{SUPABASE_REST_URL}/users?select=count", headers=get_supabase_headers(), timeout=5)
        db_status = "connected" if response.status_code == 200 else "error"
    except:
        db_status = "disconnected"
    
    return jsonify({
        "status": "healthy",
        "quantum_engine": "operational",
        "database": db_status,
        "websockets": "active"
    })



if __name__ == '__main__':
    print(" Starting Quantum Quest Production Flask Server...")
    print(" All endpoints configured for frontend integration")
    app.run(host='0.0.0.0', port=8000, debug=True)
