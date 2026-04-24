from flask import Blueprint, request, jsonify
from models.firebase_config import get_db
from datetime import datetime

alerts_bp = Blueprint('alerts', __name__)
db = get_db()

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    docs = db.collection('alerts').order_by('timestamp', direction='DESCENDING').stream()
    alerts = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        alerts.append(d)
    return jsonify(alerts)

@alerts_bp.route('/', methods=['POST'])
def add_alert():
    data = request.json
    if not data or 'message' not in data or 'type' not in data:
        return jsonify({'error': 'Missing fields'}), 400
    ref = db.collection('alerts').document()
    alert = {
        'message': data['message'],
        'type': data['type'],
        'timestamp': datetime.utcnow().isoformat(),
        'read': data.get('read', False)
    }
    ref.set(alert)
    alert['id'] = ref.id
    return jsonify(alert), 201

@alerts_bp.route('/<alert_id>', methods=['PUT'])
def update_alert(alert_id):
    data = request.json
    ref = db.collection('alerts').document(alert_id)
    if not ref.get().exists:
        return jsonify({'error': 'Alert not found'}), 404
    ref.update(data)
    return jsonify({'id': alert_id, **data})

@alerts_bp.route('/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    ref = db.collection('alerts').document(alert_id)
    if not ref.get().exists:
        return jsonify({'error': 'Alert not found'}), 404
    ref.delete()
    return jsonify({'message': 'Deleted'})

@alerts_bp.route('/check-threshold', methods=['POST'])
def check_threshold():
    data = request.json
    threshold = data.get('threshold', 5.0)
    docs = list(db.collection('energy').order_by('timestamp', direction='DESCENDING').limit(1).stream())
    latest = None
    for doc in docs:
        latest = doc.to_dict()
    if latest and latest.get('usage', 0) > threshold:
        ref = db.collection('alerts').document()
        ref.set({
            'message': f"Usage exceeded threshold: {latest['usage']} kW",
            'type': 'critical',
            'timestamp': datetime.utcnow().isoformat(),
            'read': False
        })
        return jsonify({'alert_triggered': True})
    return jsonify({'alert_triggered': False})

@alerts_bp.route('/stats', methods=['GET'])
def alert_stats():
    docs = db.collection('alerts').stream()
    types = {}
    daily = {}
    total = 0
    unread = 0
    critical = 0
    for doc in docs:
        d = doc.to_dict()
        t = d.get('type', 'info')
        types[t] = types.get(t, 0) + 1
        day = d.get('timestamp', '')[:10]
        daily[day] = daily.get(day, 0) + 1
        total += 1
        if not d.get('read', False):
            unread += 1
        if t == 'critical':
            critical += 1
    return jsonify({
        'total': total,
        'unread': unread,
        'critical': critical,
        'by_type': [{'type': k, 'count': v} for k, v in sorted(types.items())],
        'by_day': [{'date': k, 'count': v} for k, v in sorted(daily.items())]
    })

