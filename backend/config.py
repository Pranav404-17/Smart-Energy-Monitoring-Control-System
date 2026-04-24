import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-energy-secret-key')
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    CORS_ORIGINS = ['http://localhost:3000']

