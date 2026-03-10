from datetime import datetime
from app.extensions import db, ma


class Patient(db.Model):
    """Modelo de Paciente"""
    
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date)
    cpf = db.Column(db.String(14), unique=True)
    address = db.Column(db.Text)
    health_plan = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Patient {self.name}>'


class PatientSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Paciente"""
    
    class Meta:
        model = Patient
        load_instance = True
        include_fk = True


# Schemas para diferentes usos
patient_schema = PatientSchema()
patients_schema = PatientSchema(many=True)
