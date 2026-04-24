import os

try:
    from firebase_admin import credentials, initialize_app, firestore
    import firebase_admin
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

from .mock_firebase import MockFirestore

def init_firebase():
    if not FIREBASE_AVAILABLE:
        return False
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    try:
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            initialize_app(cred, {
                'databaseURL': os.environ.get('FIREBASE_DATABASE_URL', 'https://smart-energy-default.firebaseio.com')
            })
        else:
            cred = credentials.ApplicationDefault()
            initialize_app(cred, {
                'databaseURL': os.environ.get('FIREBASE_DATABASE_URL', 'https://smart-energy-default.firebaseio.com')
            })
        return True
    except Exception:
        return False

def get_db():
    if FIREBASE_AVAILABLE:
        try:
            return firestore.client()
        except Exception:
            pass
    return MockFirestore()

