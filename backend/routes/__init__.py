from flask import Blueprint
from .devices import devices_bp
from .energy import energy_bp
from .alerts import alerts_bp
from .automation import automation_bp

def register_routes(app):
    app.register_blueprint(devices_bp, url_prefix='/devices')
    app.register_blueprint(energy_bp, url_prefix='/energy')
    app.register_blueprint(alerts_bp, url_prefix='/alerts')
    app.register_blueprint(automation_bp, url_prefix='/automation')

