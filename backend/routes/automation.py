from flask import Blueprint, request, jsonify
from models.firebase_config import get_db

automation_bp = Blueprint('automation', __name__)
db = get_db()

@automation_bp.route('/', methods=['GET'])
def get_rules():
    docs = db.collection('automation').stream()
    rules = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        rules.append(d)
    return jsonify(rules)

@automation_bp.route('/', methods=['POST'])
def add_rule():
    data = request.json
    if not data or 'name' not in data or 'rule_type' not in data:
        return jsonify({'error': 'Missing fields'}), 400
    ref = db.collection('automation').document()
    rule = {
        'name': data['name'],
        'rule_type': data['rule_type'],
        'device_id': data.get('device_id', ''),
        'schedule': data.get('schedule', ''),
        'action': data.get('action', 'off'),
        'threshold': data.get('threshold', 0.0),
        'active': data.get('active', True)
    }
    ref.set(rule)
    rule['id'] = ref.id
    return jsonify(rule), 201

@automation_bp.route('/<rule_id>', methods=['PUT'])
def update_rule(rule_id):
    data = request.json
    ref = db.collection('automation').document(rule_id)
    if not ref.get().exists:
        return jsonify({'error': 'Rule not found'}), 404
    ref.update(data)
    return jsonify({'id': rule_id, **data})

@automation_bp.route('/<rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    ref = db.collection('automation').document(rule_id)
    if not ref.get().exists:
        return jsonify({'error': 'Rule not found'}), 404
    ref.delete()
    return jsonify({'message': 'Deleted'})

@automation_bp.route('/evaluate', methods=['POST'])
def evaluate_rules():
    docs = db.collection('automation').where('active', '==', True).stream()
    rules = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        rules.append(d)
    
    energy_docs = list(db.collection('energy').order_by('timestamp', direction='DESCENDING').limit(1).stream())
    latest_usage = 0.0
    for doc in energy_docs:
        latest_usage = doc.to_dict().get('usage', 0)
    
    triggered = []
    for rule in rules:
        if rule['rule_type'] == 'threshold' and latest_usage > rule.get('threshold', 9999):
            triggered.append(rule)
            if rule.get('device_id'):
                device_ref = db.collection('devices').document(rule['device_id'])
                if device_ref.get().exists:
                    device_ref.update({'status': rule.get('action', 'off')})
    
    return jsonify({'triggered': triggered, 'latest_usage': latest_usage})

