from datetime import datetime
from app.extensions import db, ma


class Transaction(db.Model):
    """Modelo de Transação Financeira"""
    
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Tipo da transação
    type = db.Column(db.String(20), nullable=False)  # receita ou despesa
    category = db.Column(db.String(100), nullable=False)  # consulta, material, salario, etc
    description = db.Column(db.String(500), nullable=False)
    
    # Valores
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Informações de pagamento
    payment_method = db.Column(db.String(50))  # dinheiro, cartao, pix, etc
    status = db.Column(db.String(50), default='pendente')  # pendente, pago, cancelado
    
    # Relacionamento com paciente (opcional)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True)
    patient_name = db.Column(db.String(200))
    
    # Observações
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento opcional com paciente
    patient = db.relationship('Patient')
    
    def __repr__(self):
        return f'<Transaction {self.type} - {self.description} - R$ {self.amount}>'


class Task(db.Model):
    """Modelo de Tarefa"""
    
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='aberta')  # aberta, em_andamento, concluida, cancelada
    priority = db.Column(db.String(20), default='media')  # baixa, media, alta
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Task {self.title}>'


class TransactionSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Transação"""
    
    class Meta:
        model = Transaction
        load_instance = True
        include_fk = True


class TaskSchema(ma.SQLAlchemyAutoSchema):
    """Schema para serialização de Tarefa"""
    
    class Meta:
        model = Task
        load_instance = True


# Schemas
transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)
