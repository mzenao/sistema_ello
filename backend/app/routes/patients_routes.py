from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.patients import Patient, patient_schema, patients_schema
from app.auth import token_required
from datetime import datetime

patients_bp = Blueprint('patients', __name__)


@patients_bp.route('', methods=['GET'])
@token_required
def list_patients():
    """Listar todos os pacientes (requer autenticação)"""
    try:
        patients = Patient.query.order_by(Patient.name).all()
        return jsonify(patients_schema.dump(patients)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_patient(id):
    """Buscar paciente por ID (requer autenticação)"""
    try:
        patient = Patient.query.get_or_404(id)
        return jsonify(patient_schema.dump(patient)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@patients_bp.route('', methods=['POST'])
@token_required
def create_patient():
    """Criar novo paciente (requer autenticação)"""
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data.get('name'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        if not data.get('phone'):
            return jsonify({'error': 'Telefone é obrigatório'}), 400
        
        # Converter birth_date se fornecido
        if data.get('birth_date'):
            try:
                data['birth_date'] = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data de nascimento inválida (use YYYY-MM-DD)'}), 400
        
        patient = Patient(**data)
        db.session.add(patient)
        db.session.commit()
        
        return jsonify(patient_schema.dump(patient)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_patient(id):
    """Atualizar paciente existente (requer autenticação)"""
    try:
        patient = Patient.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        if 'name' in data:
            patient.name = data['name']
        if 'email' in data:
            patient.email = data['email']
        if 'phone' in data:
            patient.phone = data['phone']
        if 'cpf' in data:
            patient.cpf = data['cpf']
        if 'address' in data:
            patient.address = data['address']
        if 'health_plan' in data:
            patient.health_plan = data['health_plan']
        if 'notes' in data:
            patient.notes = data['notes']
        if 'birth_date' in data and data['birth_date']:
            try:
                patient.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data de nascimento inválida'}), 400
        
        db.session.commit()
        return jsonify(patient_schema.dump(patient)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_patient(id):
    """Deletar paciente (requer autenticação)"""
    try:
        patient = Patient.query.get_or_404(id)
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'message': 'Paciente deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@patients_bp.route('/search', methods=['GET'])
@token_required
def search_patients():
    """Buscar pacientes por nome ou telefone (requer autenticação)"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify([]), 200
        
        patients = Patient.query.filter(
            db.or_(
                Patient.name.ilike(f'%{query}%'),
                Patient.phone.ilike(f'%{query}%')
            )
        ).order_by(Patient.name).all()
        
        return jsonify(patients_schema.dump(patients)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
