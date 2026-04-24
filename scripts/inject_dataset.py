import csv
import json
import os
from datetime import datetime, timedelta
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, '..')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
DATA_DIR = os.path.join(BACKEND_DIR, 'data')
DATASET_PATH = os.path.join(ROOT_DIR, 'energy_500_rows.csv')

def inject_dataset():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: {DATASET_PATH} not found.")
        return

    print("Parsing energy_500_rows.csv...")
    
    # We will take the last 30 days of data from the file
    # But since the file is large, we'll read only a portion or use a limited window.
    # Actually, let's just take the first 43,200 rows (approx 30 days) for simplicity,
    # and map them to the last 30 days starting from "now".
    
    devices = [
        {'id': str(uuid.uuid4()), 'name': 'Microwave & Oven', 'room': 'Kitchen', 'status': 'on', 'energy_consumption': 1.2},
        {'id': str(uuid.uuid4()), 'name': 'Washing Machine', 'room': 'Bathroom', 'status': 'on', 'energy_consumption': 0.8},
        {'id': str(uuid.uuid4()), 'name': 'AC & Water Heater', 'room': 'Bedroom', 'status': 'on', 'energy_consumption': 2.0},
    ]
    
    device_map = {
        'Sub_metering_1': devices[0], # Kitchen
        'Sub_metering_2': devices[1], # Bathroom/Laundry
        'Sub_metering_3': devices[2], # Bedroom/AC
    }

    energy_data = {}
    device_energy_data = {}
    
    now = datetime.utcnow()
    start_time = now - timedelta(days=30)
    
    with open(DATASET_PATH, 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        count = 0
        max_rows = 30 * 24 * 60 # 30 days at 1 min intervals
        
        for row in reader:
            if count >= max_rows:
                break
                
            try:
                # Map dataset timestamp to our 30-day window
                current_ts = start_time + timedelta(minutes=count)
                ts_str = current_ts.isoformat()
                
                # Global active power in kW
                gap = float(row['Global_active_power']) if row['Global_active_power'] != '?' else 0.0
                usage_kwh = (gap / 60.0) # Energy in 1 minute
                
                energy_data[str(uuid.uuid4())] = {
                    'timestamp': ts_str,
                    'usage': round(usage_kwh, 4),
                    'cost': round(usage_kwh * 0.15, 4)
                }
                
                # Sub metering data in Wh -> convert to kWh
                for sm_key, device in device_map.items():
                    sm_val = float(row[sm_key]) if row[sm_key] != '?' else 0.0
                    sm_kwh = sm_val / 1000.0
                    
                    device_energy_data[str(uuid.uuid4())] = {
                        'timestamp': ts_str,
                        'device_id': device['id'],
                        'device_name': device['name'],
                        'room': device['room'],
                        'usage': round(sm_kwh, 4),
                        'cost': round(sm_kwh * 0.15, 4)
                    }
                    
                count += 1
                if count % 5000 == 0:
                    print(f"Processed {count} rows...")
                    
            except (ValueError, KeyError) as e:
                continue

    # Save to JSON files
    os.makedirs(DATA_DIR, exist_ok=True)
    
    with open(os.path.join(DATA_DIR, 'devices.json'), 'w') as f:
        json.dump({d['id']: {k:v for k,v in d.items() if k != 'id'} for d in devices}, f, indent=2)
        
    with open(os.path.join(DATA_DIR, 'energy.json'), 'w') as f:
        json.dump(energy_data, f, indent=2)
        
    with open(os.path.join(DATA_DIR, 'device_energy.json'), 'w') as f:
        json.dump(device_energy_data, f, indent=2)
        
    # Also generate dummy alerts and settings
    alerts = {
        str(uuid.uuid4()): {'message': 'Dataset imported successfully', 'type': 'info', 'timestamp': now.isoformat(), 'read': False}
    }
    with open(os.path.join(DATA_DIR, 'alerts.json'), 'w') as f:
        json.dump(alerts, f, indent=2)
        
    settings = {
        'global': {
            'user': {'name': 'Admin', 'email': 'admin@smartenergy.com'},
            'rate': 0.15,
            'notifications': {'email': True, 'push': True, 'sms': False}
        }
    }
    with open(os.path.join(DATA_DIR, 'settings.json'), 'w') as f:
        json.dump(settings, f, indent=2)
        
    with open(os.path.join(DATA_DIR, 'automation.json'), 'w') as f:
        json.dump({}, f, indent=2)

    print("Injection complete!")

if __name__ == '__main__':
    inject_dataset()
