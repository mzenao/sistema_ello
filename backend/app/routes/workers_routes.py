from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.workers import Worker, worker_schema, workers_schema
from app.models.users import User
from app.auth import token_required
from datetime import datetime

workers_bp = Blueprint('workers', __name__)


def clean_cpf(cpf_str):
    """Remove pontos, traços e espaços do CPF"""
    if not cpf_str:
        return None
    return ''.join(c for c in str(cpf_str) if c.isdigit())


@workers_bp.route('', methods=['GET'])
@token_required
def list_workers():
    """Listar todos os funcionários (requer autenticação)"""
    try:
        workers = Worker.query.order_by(Worker.name).all()
        return jsonify(workers_schema.dump(workers)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workers_bp.route('/<int:id>', methods=['GET'])
@token_required
def get_worker(id):
    """Buscar funcionário por ID (requer autenticação)"""
    try:
        worker = Worker.query.get_or_404(id)
        return jsonify(worker_schema.dump(worker)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@workers_bp.route('', methods=['POST'])
@token_required
def create_worker():
    """Criar novo funcionário (requer autenticação)"""
    try:
        data = request.get_json() or {}
        
        # Validações básicas
        if not data.get('name'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
        if not data.get('phone'):
            return jsonify({'error': 'Telefone é obrigatório'}), 400

        # Para novo funcionário, também criamos usuário de login
        if not data.get('email'):
            return jsonify({'error': 'Email é obrigatório para criar login do funcionário'}), 400
        if not data.get('password'):
            return jsonify({'error': 'Senha é obrigatória para criar login do funcionário'}), 400
        if len(str(data.get('password'))) < 6:
            return jsonify({'error': 'Senha deve ter no mínimo 6 caracteres'}), 400

        # Não permitir duplicidade de login
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Já existe usuário com este email'}), 400
        
        # Limpar CPF (remover pontos, traços, espaços)
        if data.get('cpf'):
            data['cpf'] = clean_cpf(data['cpf'])
        
        # Converter admission_date se fornecido
        if data.get('admission_date') and isinstance(data['admission_date'], str):
            try:
                data['admission_date'] = datetime.strptime(data['admission_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data de admissão inválida (use YYYY-MM-DD)'}), 400

        # Regra de perfil: gerente => admin, demais => user
        ocupance = str(data.get('ocupance') or '').strip().lower()
        role = 'admin' if ocupance == 'gerente' else 'user'

        # Criar usuário de autenticação vinculado por email/nome
        user = User(
            email=data['email'],
            name=data.get('name') or data['email'],
            role=role,
            is_active=True
        )
        user.set_password(str(data['password']))

        # Apenas campos do Worker (não incluir password no modelo)
        worker_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'cpf': data.get('cpf'),
            'admission_date': data.get('admission_date'),
            'ocupance': data.get('ocupance'),
            'speciality': data.get('speciality'),
            'salary': data.get('salary'),
            'notes': data.get('notes'),
        }

        worker = Worker(**worker_data)
        db.session.add(user)
        db.session.add(worker)
        db.session.commit()
        
        return jsonify(worker_schema.dump(worker)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@workers_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_worker(id):
    """Atualizar funcionário (requer autenticação)"""
    try:
        worker = Worker.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        for key, value in data.items():
            if key == 'cpf' and value:
                # Limpar CPF (remover pontos, traços, espaços)
                value = clean_cpf(value)
            elif key == 'admission_date' and isinstance(value, str):
                try:
                    value = datetime.strptime(value, '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Data de admissão inválida (use YYYY-MM-DD)'}), 400
            
            if hasattr(worker, key):
                setattr(worker, key, value)
        
        worker.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(worker_schema.dump(worker)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@workers_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_worker(id):
    """Deletar funcionário (requer autenticação)"""
    try:
        worker = Worker.query.get_or_404(id)
        db.session.delete(worker)
        db.session.commit()
        
        return jsonify({'message': 'Funcionário deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
