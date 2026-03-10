from datetime import datetime
from app.extensions import db, ma


class Appointment(db.Model):
    """Modelo de Agendamento"""
    
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Informações do paciente (pode ser vinculado ou não)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True)
    patient_name = db.Column(db.String(200), nullable=False)
    patient_phone = db.Column(db.String(20), nullable=False)
    patient_email = db.Column(db.String(200))
    
    # Informações do agendamento
    service = db.Column(db.String(100), nullable=False)  # consulta, clareamento, etc
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(50), default='agendado')  # agendado, confirmado, realizado, cancelado, faltou
    
    # Informações adicionais
    dentist = db.Column(db.String(200))
    value = db.Column(db.Numeric(10, 2), default=0)
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento opcional com paciente
    patient = db.relationship('Patient')
    
    def __repr__(self):
        return f'<Appointment {self.patient_name} - {self.date} {self.time}>'


class AppointmentSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Agendamento"""
    
    class Meta:
        model = Appointment
        load_instance = True
        include_fk = True


# Schemas
appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)
