import random
from datetime import datetime, timedelta
import uuid

def generate_devices():
    rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Office']
    devices = [
        {'id': str(uuid.uuid4()), 'name': 'Smart TV', 'room': 'Living Room', 'status': 'on', 'energy_consumption': round(random.uniform(0.1, 0.5), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Air Conditioner', 'room': 'Bedroom', 'status': 'on', 'energy_consumption': round(random.uniform(1.5, 2.5), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Refrigerator', 'room': 'Kitchen', 'status': 'on', 'energy_consumption': round(random.uniform(0.1, 0.3), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Washing Machine', 'room': 'Bathroom', 'status': 'off', 'energy_consumption': round(random.uniform(0.5, 1.0), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Desktop PC', 'room': 'Office', 'status': 'on', 'energy_consumption': round(random.uniform(0.3, 0.8), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Microwave', 'room': 'Kitchen', 'status': 'off', 'energy_consumption': round(random.uniform(0.8, 1.5), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Heater', 'room': 'Living Room', 'status': 'off', 'energy_consumption': round(random.uniform(1.0, 2.0), 2)},
        {'id': str(uuid.uuid4()), 'name': 'Water Heater', 'room': 'Bathroom', 'status': 'on', 'energy_consumption': round(random.uniform(1.0, 1.8), 2)},
    ]
    return devices

def generate_energy_data():
    data = []
    base = datetime.utcnow() - timedelta(days=30)
    for day in range(30):
        for hour in range(24):
            ts = base + timedelta(days=day, hours=hour)
            usage = round(random.uniform(0.5, 3.5) + (1.5 if 18 <= hour <= 22 else 0.5), 2)
            data.append({
                'timestamp': ts.isoformat(),
                'usage': usage,
                'cost': round(usage * 0.15, 2)
            })
    return data

def generate_device_energy_data(devices):
    data = []
    base = datetime.utcnow() - timedelta(days=30)
    for day in range(30):
        for hour in range(24):
            ts = base + timedelta(days=day, hours=hour)
            for device in devices:
                if device['name'] == 'Refrigerator':
                    prob_on = 0.95
                elif device['name'] in ['Air Conditioner', 'Heater', 'Water Heater']:
                    prob_on = 0.4 + (0.4 if 18 <= hour <= 22 else 0.1)
                elif device['name'] in ['Smart TV', 'Desktop PC']:
                    prob_on = 0.3 + (0.5 if 18 <= hour <= 23 else 0.05)
                else:
                    prob_on = 0.15 + (0.3 if 18 <= hour <= 21 else 0.05)
                if random.random() < prob_on:
                    usage = round(device['energy_consumption'] * random.uniform(0.7, 1.0), 2)
                    data.append({
                        'timestamp': ts.isoformat(),
                        'device_id': device['id'],
                        'device_name': device['name'],
                        'room': device['room'],
                        'usage': usage,
                        'cost': round(usage * 0.15, 2)
                    })
    return data

def generate_alerts():
    alerts = [
        {'id': str(uuid.uuid4()), 'message': 'High energy usage detected', 'type': 'warning', 'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(), 'read': False},
        {'id': str(uuid.uuid4()), 'message': 'AC running for over 8 hours', 'type': 'info', 'timestamp': (datetime.utcnow() - timedelta(hours=5)).isoformat(), 'read': False},
        {'id': str(uuid.uuid4()), 'message': 'Spike in kitchen usage', 'type': 'critical', 'timestamp': (datetime.utcnow() - timedelta(days=1)).isoformat(), 'read': True},
    ]
    return alerts

def generate_automation_rules():
    rules = [
        {'id': str(uuid.uuid4()), 'device_id': '', 'name': 'Turn off lights at midnight', 'schedule': '0 0 * * *', 'action': 'off', 'rule_type': 'schedule'},
        {'id': str(uuid.uuid4()), 'device_id': '', 'name': 'Turn off heater if usage > 5kW', 'schedule': '', 'action': 'off', 'rule_type': 'threshold', 'threshold': 5.0}
    ]
    return rules

def generate_settings():
    return {
        'user': {'name': 'Admin', 'email': 'admin@smartenergy.com'},
        'rate': 0.15,
        'notifications': {'email': True, 'push': True, 'sms': False}
    }

def generate_all_data():
    devices = generate_devices()
    return {
        'devices': devices,
        'energy': generate_energy_data(),
        'device_energy': generate_device_energy_data(devices),
        'alerts': generate_alerts(),
        'automation': generate_automation_rules(),
        'settings': generate_settings()
    }

