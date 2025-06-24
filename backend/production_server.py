#!/usr/bin/env python3
"""
Production Flask Backend Server for Quantum Quest
Uses HTTP requests to Supabase for better compatibility
"""
from flask import Flask
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

if __name__ == '__main__':
    print("🚀 Starting Quantum Quest Production Flask Server...")
    app.run(host='0.0.0.0', port=8000, debug=True)
