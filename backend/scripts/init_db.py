"""
Script para inicializar o banco de dados e criar as tabelas
"""
import sys
import os

# Adicionar o diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from app.models.patients import Patient
from app.models.appointment import Appointment
from app.models.financial import Transaction, Task
from datetime import datetime, date, time


def init_db():
    """Inicializar banco de dados"""
    app = create_app('development')
    
    with app.app_context():
        print("🗄️  Criando tabelas...")
        db.create_all()
        print("✅ Tabelas criadas com sucesso!")
        
        # Verificar se já existem dados
        if Patient.query.first():
            print("⚠️  Banco de dados já contém dados.")
            response = input("Deseja adicionar dados de exemplo mesmo assim? (s/n): ")
            if response.lower() != 's':
                return
        
        print("\n📊 Adicionando dados de exemplo...")
        add_sample_data()
        print("✅ Dados de exemplo adicionados com sucesso!")


def add_sample_data():
    """Adicionar dados de exemplo"""
    
    # Pacientes
    patients = [
        Patient(
            name="Maria Clara Silva",
            email="maria.clara@email.com",
            phone="(32) 99999-1111",
            birth_date=date(1990, 5, 15),
            cpf="111.222.333-44",
            address="Rua das Flores, 123 - Centro",
            health_plan="Unimed"
        ),
        Patient(
            name="João Pedro Santos",
            email="joao.pedro@email.com",
            phone="(32) 98888-2222",
            birth_date=date(1985, 8, 20),
            cpf="222.333.444-55",
            address="Av. Principal, 456 - Bairro Novo"
        ),
        Patient(
            name="Ana Beatriz Costa",
            email="ana.beatriz@email.com",
            phone="(32) 97777-3333",
            birth_date=date(1995, 12, 10),
            address="Rua do Comércio, 789"
        ),
    ]
    
    for patient in patients:
        db.session.add(patient)
    
    db.session.commit()
    print(f"  ✓ {len(patients)} pacientes adicionados")
    
    # Agendamentos
    appointments = [
        Appointment(
            patient_id=1,
            patient_name="Maria Clara Silva",
            patient_phone="(32) 99999-1111",
            service="clareamento",
            date=date(2026, 3, 15),
            time=time(10, 0),
            status="confirmado",
            dentist="Dr. Carlos",
            value=900
        ),
        Appointment(
            patient_id=2,
            patient_name="João Pedro Santos",
            patient_phone="(32) 98888-2222",
            service="canal",
            date=date(2026, 3, 16),
            time=time(14, 30),
            status="agendado",
            dentist="Dra. Paula",
            value=1200
        ),
        Appointment(
            patient_id=3,
            patient_name="Ana Beatriz Costa",
            patient_phone="(32) 97777-3333",
            service="consulta",
            date=date(2026, 3, 10),
            time=time(9, 0),
            status="realizado",
            value=150
        ),
    ]
    
    for appointment in appointments:
        db.session.add(appointment)
    
    db.session.commit()
    print(f"  ✓ {len(appointments)} agendamentos adicionados")
    
    # Transações
    transactions = [
        Transaction(
            type="receita",
            category="consulta",
            description="Consulta - Ana Beatriz",
            amount=150,
            date=date(2026, 3, 10),
            payment_method="pix",
            status="pago",
            patient_id=3,
            patient_name="Ana Beatriz Costa"
        ),
        Transaction(
            type="despesa",
            category="material",
            description="Material odontológico - Fornecedor XYZ",
            amount=320.50,
            date=date(2026, 3, 5),
            payment_method="cartao",
            status="pago"
        ),
        Transaction(
            type="despesa",
            category="salario",
            description="Salário - Recepcionista",
            amount=2500,
            date=date(2026, 3, 1),
            payment_method="pix",
            status="pago"
        ),
        Transaction(
            type="receita",
            category="clareamento",
            description="Clareamento - João Silva",
            amount=850,
            date=date(2026, 3, 8),
            payment_method="dinheiro",
            status="pago"
        ),
    ]
    
    for transaction in transactions:
        db.session.add(transaction)
    
    db.session.commit()
    print(f"  ✓ {len(transactions)} transações adicionadas")
    
    # Tarefas
    tasks = [
        Task(
            title="Conferir estoque de luvas e máscaras",
            date=date(2026, 3, 12),
            status="aberta",
            priority="alta",
            notes="Verificar se precisa fazer pedido"
        ),
        Task(
            title="Ligar para fornecedor de material",
            date=date(2026, 3, 13),
            status="em_andamento",
            priority="media"
        ),
        Task(
            title="Organizar arquivo de prontuários",
            date=date(2026, 3, 14),
            status="aberta",
            priority="baixa"
        ),
    ]
    
    for task in tasks:
        db.session.add(task)
    
    db.session.commit()
    print(f"  ✓ {len(tasks)} tarefas adicionadas")


if __name__ == '__main__':
    init_db()
