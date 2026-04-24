from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from models.firebase_config import init_firebase, get_db
from models.dataset_generator import generate_all_data
from routes import register_routes
import os

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=app.config['CORS_ORIGINS'])

init_firebase()
db = get_db()

def seed_data():
    collections = ['devices', 'energy', 'device_energy', 'alerts', 'automation', 'settings']
    has_data = False
    for col in collections:
        docs = list(db.collection(col).limit(1).stream())
        if len(docs) > 0:
            has_data = True
            break
    
    if not has_data:
        data = generate_all_data()
        for device in data['devices']:
            db.collection('devices').document(device['id']).set({k: v for k, v in device.items() if k != 'id'})
        for entry in data['energy']:
            db.collection('energy').add(entry)
        for entry in data['device_energy']:
            db.collection('device_energy').add(entry)
        for alert in data['alerts']:
            db.collection('alerts').document(alert['id']).set({k: v for k, v in alert.items() if k != 'id'})
        for rule in data['automation']:
            db.collection('automation').document(rule['id']).set({k: v for k, v in rule.items() if k != 'id'})
        db.collection('settings').document('global').set(data['settings'])

seed_data()
register_routes(app)

@app.route('/')
def index():
    return jsonify({'message': 'Smart Energy API'})

@app.route('/settings', methods=['GET'])
def get_settings():
    doc = db.collection('settings').document('global').get()
    if doc.exists:
        return jsonify(doc.to_dict())
    return jsonify({})

@app.route('/settings', methods=['PUT'])
def update_settings():
    data = request.json
    db.collection('settings').document('global').update(data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

