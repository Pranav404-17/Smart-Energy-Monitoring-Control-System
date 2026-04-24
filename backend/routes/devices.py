from flask import Blueprint, request, jsonify
from models.firebase_config import get_db

devices_bp = Blueprint('devices', __name__)
db = get_db()

@devices_bp.route('/', methods=['GET'])
def get_devices():
    docs = db.collection('devices').stream()
    devices = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        devices.append(d)
    return jsonify(devices)

@devices_bp.route('/', methods=['POST'])
def add_device():
    data = request.json
    if not data or 'name' not in data or 'room' not in data:
        return jsonify({'error': 'Missing fields'}), 400
    ref = db.collection('devices').document()
    device = {
        'name': data['name'],
        'room': data['room'],
        'status': data.get('status', 'off'),
        'energy_consumption': data.get('energy_consumption', 0.0)
    }
    ref.set(device)
    device['id'] = ref.id
    return jsonify(device), 201

@devices_bp.route('/<device_id>', methods=['PUT'])
def update_device(device_id):
    data = request.json
    ref = db.collection('devices').document(device_id)
    if not ref.get().exists:
        return jsonify({'error': 'Device not found'}), 404
    ref.update(data)
    return jsonify({'id': device_id, **data})

@devices_bp.route('/<device_id>', methods=['DELETE'])
def delete_device(device_id):
    ref = db.collection('devices').document(device_id)
    if not ref.get().exists:
        return jsonify({'error': 'Device not found'}), 404
    ref.delete()
    return jsonify({'message': 'Deleted'})

@devices_bp.route('/<device_id>/toggle', methods=['POST'])
def toggle_device(device_id):
    ref = db.collection('devices').document(device_id)
    doc = ref.get()
    if not doc.exists:
        return jsonify({'error': 'Device not found'}), 404
    current_status = doc.to_dict().get('status', 'off')
    new_status = 'on' if current_status == 'off' else 'off'
    ref.update({'status': new_status})
    return jsonify({'id': device_id, 'status': new_status})

@devices_bp.route('/stats', methods=['GET'])
def device_stats():
    docs = db.collection('devices').stream()
    rooms = {}
    status = {'on': 0, 'off': 0}
    total_capacity = 0.0
    for doc in docs:
        d = doc.to_dict()
        room = d.get('room', 'Unknown')
        rooms[room] = rooms.get(room, 0) + 1
        status[d.get('status', 'off')] += 1
        total_capacity += d.get('energy_consumption', 0)
    return jsonify({
        'count_by_room': [{'room': k, 'count': v} for k, v in sorted(rooms.items())],
        'status_distribution': [{'status': k, 'count': v} for k, v in status.items()],
        'total_capacity': round(total_capacity, 2),
        'total_devices': sum(status.values())
    })

