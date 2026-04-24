from flask import Blueprint, jsonify
from models.firebase_config import get_db
from datetime import datetime, timedelta

energy_bp = Blueprint('energy', __name__)
db = get_db()

@energy_bp.route('/realtime', methods=['GET'])
def realtime():
    docs = list(db.collection('energy').order_by('timestamp', direction='DESCENDING').limit(1).stream())
    latest = None
    for doc in docs:
        latest = doc.to_dict()
    if not latest:
        return jsonify({'usage': 0, 'cost': 0})
    return jsonify(latest)

@energy_bp.route('/today', methods=['GET'])
def today_usage():
    today = datetime.utcnow().strftime('%Y-%m-%d')
    docs = db.collection('energy').stream()
    total = 0.0
    for doc in docs:
        d = doc.to_dict()
        if d['timestamp'].startswith(today):
            total += d.get('usage', 0)
    return jsonify({'total': round(total, 2)})

@energy_bp.route('/monthly', methods=['GET'])
def monthly_usage():
    now = datetime.utcnow()
    year_month = now.strftime('%Y-%m')
    docs = db.collection('energy').stream()
    total = 0.0
    for doc in docs:
        d = doc.to_dict()
        if d['timestamp'].startswith(year_month):
            total += d.get('usage', 0)
    return jsonify({'total': round(total, 2)})

@energy_bp.route('/bill', methods=['GET'])
def estimated_bill():
    now = datetime.utcnow()
    year_month = now.strftime('%Y-%m')
    docs = db.collection('energy').stream()
    total_usage = 0.0
    for doc in docs:
        d = doc.to_dict()
        if d['timestamp'].startswith(year_month):
            total_usage += d.get('usage', 0)
    settings_ref = db.collection('settings').document('global').get()
    rate = 0.15
    if settings_ref.exists:
        rate = settings_ref.to_dict().get('rate', 0.15)
    bill = total_usage * rate
    return jsonify({'estimated_bill': round(bill, 2), 'rate': rate})

@energy_bp.route('/history', methods=['GET'])
def history():
    docs = db.collection('energy').order_by('timestamp').stream()
    data = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        data.append(d)
    return jsonify(data)

@energy_bp.route('/daily', methods=['GET'])
def daily():
    docs = db.collection('energy').stream()
    daily_data = {}
    for doc in docs:
        d = doc.to_dict()
        day = d['timestamp'][:10]
        daily_data[day] = daily_data.get(day, 0) + d.get('usage', 0)
    result = [{'date': k, 'usage': round(v, 2)} for k, v in sorted(daily_data.items())]
    return jsonify(result)

@energy_bp.route('/weekly', methods=['GET'])
def weekly():
    docs = db.collection('energy').stream()
    weekly_data = {}
    for doc in docs:
        d = doc.to_dict()
        dt = datetime.fromisoformat(d['timestamp'])
        year_week = dt.strftime('%Y-W%U')
        weekly_data[year_week] = weekly_data.get(year_week, 0) + d.get('usage', 0)
    result = [{'week': k, 'usage': round(v, 2)} for k, v in sorted(weekly_data.items())]
    return jsonify(result)

@energy_bp.route('/hourly', methods=['GET'])
def hourly():
    docs = db.collection('energy').stream()
    hourly_data = {}
    for doc in docs:
        d = doc.to_dict()
        hour = d['timestamp'][:13]
        hourly_data[hour] = hourly_data.get(hour, 0) + d.get('usage', 0)
    result = [{'hour': k, 'usage': round(v, 2)} for k, v in sorted(hourly_data.items())]
    return jsonify(result)

@energy_bp.route('/compare', methods=['GET'])
def compare():
    now = datetime.utcnow()
    current_month = now.strftime('%Y-%m')
    prev = now - timedelta(days=30)
    prev_month = prev.strftime('%Y-%m')
    docs = db.collection('energy').stream()
    current_total = 0.0
    prev_total = 0.0
    for doc in docs:
        d = doc.to_dict()
        ts = d['timestamp'][:7]
        if ts == current_month:
            current_total += d.get('usage', 0)
        elif ts == prev_month:
            prev_total += d.get('usage', 0)
    return jsonify({
        'current_month': round(current_total, 2),
        'previous_month': round(prev_total, 2),
        'difference': round(current_total - prev_total, 2)
    })

@energy_bp.route('/peak-hours', methods=['GET'])
def peak_hours():
    docs = db.collection('energy').stream()
    hours = {}
    for doc in docs:
        d = doc.to_dict()
        hour = int(d['timestamp'][11:13])
        hours[hour] = hours.get(hour, 0) + d.get('usage', 0)
    result = [{'hour': f"{h:02d}:00", 'usage': round(v, 2)} for h, v in sorted(hours.items())]
    return jsonify(result)

@energy_bp.route('/by-room', methods=['GET'])
def by_room():
    docs = db.collection('device_energy').stream()
    room_data = {}
    for doc in docs:
        d = doc.to_dict()
        room = d.get('room', 'Unknown')
        room_data[room] = room_data.get(room, 0) + d.get('usage', 0)
    result = [{'room': k, 'usage': round(v, 2)} for k, v in sorted(room_data.items(), key=lambda x: x[1], reverse=True)]
    return jsonify(result)

@energy_bp.route('/by-device', methods=['GET'])
def by_device():
    docs = db.collection('device_energy').stream()
    device_data = {}
    for doc in docs:
        d = doc.to_dict()
        name = d.get('device_name', 'Unknown')
        device_data[name] = device_data.get(name, 0) + d.get('usage', 0)
    result = [{'device': k, 'usage': round(v, 2)} for k, v in sorted(device_data.items(), key=lambda x: x[1], reverse=True)]
    return jsonify(result)

@energy_bp.route('/cost-trend', methods=['GET'])
def cost_trend():
    docs = db.collection('energy').stream()
    daily_cost = {}
    for doc in docs:
        d = doc.to_dict()
        day = d['timestamp'][:10]
        daily_cost[day] = daily_cost.get(day, 0) + d.get('cost', 0)
    result = [{'date': k, 'cost': round(v, 2)} for k, v in sorted(daily_cost.items())]
    return jsonify(result)

@energy_bp.route('/efficiency', methods=['GET'])
def efficiency():
    docs = db.collection('device_energy').stream()
    device_hours = {}
    device_usage = {}
    for doc in docs:
        d = doc.to_dict()
        name = d.get('device_name', 'Unknown')
        device_hours[name] = device_hours.get(name, 0) + 1
        device_usage[name] = device_usage.get(name, 0) + d.get('usage', 0)

    total_usage = sum(device_usage.values())
    total_hours = sum(device_hours.values())
    avg_usage = round(total_usage / total_hours, 2) if total_hours > 0 else 0

    peak_usage = 0
    off_peak_usage = 0
    docs = db.collection('energy').stream()
    for doc in docs:
        d = doc.to_dict()
        hour = int(d['timestamp'][11:13])
        if 18 <= hour <= 22:
            peak_usage += d.get('usage', 0)
        else:
            off_peak_usage += d.get('usage', 0)

    peak_ratio = round(peak_usage / off_peak_usage, 2) if off_peak_usage > 0 else 0

    return jsonify({
        'avg_hourly_usage': avg_usage,
        'peak_to_offpeak_ratio': peak_ratio,
        'total_device_hours': total_hours,
        'most_efficient_device': min(device_usage, key=device_usage.get) if device_usage else None,
        'least_efficient_device': max(device_usage, key=device_usage.get) if device_usage else None
    })

