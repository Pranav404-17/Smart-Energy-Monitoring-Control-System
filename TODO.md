# TODO: Add More Graphs and Analysis

## Backend
- [x] 1. Update `dataset_generator.py` to generate per-device energy logs with device_id, device_name, room
- [x] 2. Update `app.py` seed_data to handle new energy data format
- [x] 3. Add new endpoints to `energy.py`: /by-room, /by-device, /cost-trend, /efficiency
- [x] 4. Add /stats endpoint to `devices.py`
- [x] 5. Add /stats endpoint to `alerts.py`

## Frontend
- [x] 6. Update `api.js` with new API bindings
- [x] 7. Update `Dashboard.js` with pie, bar, area charts + new stat cards
- [x] 8. Update `Analytics.js` with hourly, cost, room, device, efficiency charts
- [x] 9. Update `Devices.js` with room pie, status donut, energy bar, stats cards
- [x] 10. Update `Alerts.js` with alert pie, timeline bar, stats cards
- [x] 11. Update `index.css` with layout utilities

## Testing
- [x] 12. Restart backend to re-seed data
- [x] 13. Verify frontend renders all charts without errors

