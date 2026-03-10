from flask import Flask
from app.config import config
from app.extensions import db, migrate, ma, cors


def create_app(config_name='development'):
    """Factory para criar a aplicação Flask"""
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Inicializar extensões
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Carrega todos os models antes de importar rotas/schemas
    from app import models  # noqa: F401
    
    # Registrar blueprints (rotas)
    from app.routes.auth_routes import auth_bp
    from app.routes.patients_routes import patients_bp
    from app.routes.appointments_routes import appointments_bp
    from app.routes.financial_routes import financial_bp
    from app.routes.workers_routes import workers_bp
    
    # Rotas públicas
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Rotas protegidas
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(financial_bp, url_prefix='/api/financial')
    app.register_blueprint(workers_bp, url_prefix='/api/workers')
    
    # Rota de health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'API Sistema Odontológico está funcionando!'}
    
    return app
