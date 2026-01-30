"""
Configuration for Python AI Service
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration (if needed for direct DB access)
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'hiring_platform')
}

# Flask configuration
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

# Scoring weights
SCORING_WEIGHTS = {
    'task_performance': 0.40,
    'difficulty': 0.20,
    'accuracy': 0.20,
    'time_efficiency': 0.10,
    'learning_indicators': 0.10
}
