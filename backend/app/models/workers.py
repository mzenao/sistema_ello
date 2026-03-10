from datetime import datetime
from app.extensions import db, ma


class Worker(db.Model):
    """Modelo de Funcionário"""
    
    __tablename__ = 'workers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(20), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    admission_date = db.Column(db.Date)
    ocupance = db.Column(db.String(14), unique=True)
    speciality = db.Column(db.Text)
    salary = db.Column(db.String(6))
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Worker {self.name}>'


class WorkerSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Funcionário"""
    
    class Meta:
        model = Worker
        load_instance = True
        include_fk = True


# Schemas para diferentes usos
worker_schema = WorkerSchema()
workers_schema = WorkerSchema(many=True)
