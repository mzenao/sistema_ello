from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.users import User, AuthToken, user_schema, users_schema
from app.auth import token_required, admin_required
from datetime import datetime, timedelta
import secrets
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)


# REGISTRO DESABILITADO - Apenas funcionários gerados pelo admin podem fazer login
# Para criar novos usuários, use a rota admin ou insira diretamente no banco de dados
# @auth_bp.route('/register', methods=['POST'])
# def register():
#     """Registrar novo usuário"""
#     try:
#         data = request.get_json()
#         
#         # Validações
#         if not data.get('email'):
#             return jsonify({'error': 'Email é obrigatório'}), 400
#         if not data.get('password'):
#             return jsonify({'error': 'Senha é obrigatória'}), 400
#         if not data.get('name'):
#             return jsonify({'error': 'Nome é obrigatório'}), 400
#         
#         # Verificar se email já existe
#         if User.query.filter_by(email=data['email']).first():
#             return jsonify({'error': 'Email já cadastrado'}), 400
#         
#         # Validar senha (mínimo 6 caracteres)
#         if len(data['password']) < 6:
#             return jsonify({'error': 'Senha deve ter no mínimo 6 caracteres'}), 400
#         
#         # Criar novo usuário
#         user = User(
#             email=data['email'],
#             name=data['name'],
#             role='user'  # Role padrão para novos usuários
#         )
#         user.set_password(data['password'])
#         
#         db.session.add(user)
#         db.session.commit()
#         
#         logger.info(f"Novo usuário registrado: {user.email}")
#         
#         return jsonify({
#             'message': 'Usuário registrado com sucesso',
#             'user': user_schema.dump(user)
#         }), 201
#         
#     except Exception as e:
#         db.session.rollback()
#         logger.error(f"Erro ao registrar usuário: {str(e)}", exc_info=True)
#         return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Fazer login e obter token de autenticação"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        # Buscar usuário
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            logger.warning(f"Tentativa de login falhada: {data.get('email')}")
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Usuário inativo'}), 401
        
        # Gerar token seguro
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)  # Token expira em 24 horas
        
        auth_token = AuthToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        
        db.session.add(auth_token)
        db.session.commit()
        
        logger.info(f"Login bem-sucedido: {user.email}")
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user_schema.dump(user),
            'expires_at': expires_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao fazer login: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Fazer logout - invalida o token"""
    try:
        user = request.current_user
        token = request.headers['Authorization'].split(" ")[1]
        
        # Deletar token
        AuthToken.query.filter_by(token=token).delete()
        db.session.commit()
        
        logger.info(f"Logout: {user.email}")
        
        return jsonify({'message': 'Logout realizado com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao fazer logout: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Obter dados do usuário autenticado"""
    try:
        user = request.current_user
        return jsonify(user_schema.dump(user)), 200
    except Exception as e:
        logger.error(f"Erro ao obter usuário atual: {str(e)}")
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/refresh-token', methods=['POST'])
@token_required
def refresh_token():
    """Renovar token de autenticação"""
    try:
        user = request.current_user
        old_token = request.headers['Authorization'].split(" ")[1]
        
        # Deletar token antigo
        AuthToken.query.filter_by(token=old_token).delete()
        
        # Criar novo token
        new_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        auth_token = AuthToken(
            user_id=user.id,
            token=new_token,
            expires_at=expires_at
        )
        
        db.session.add(auth_token)
        db.session.commit()
        
        logger.info(f"Token renovado: {user.email}")
        
        return jsonify({
            'token': new_token,
            'expires_at': expires_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao renovar token: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    """Listar todos os usuários (apenas admin)"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify(users_schema.dump(users)), 200
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    """Atualizar role de um usuário (apenas admin)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data.get('role'):
            return jsonify({'error': 'Role é obrigatório'}), 400
        
        allowed_roles = ['user', 'dentist', 'admin']
        if data['role'] not in allowed_roles:
            return jsonify({'error': f'Role inválido. Opções: {", ".join(allowed_roles)}'}), 400
        
        user.role = data['role']
        db.session.commit()
        
        logger.info(f"Role atualizado para {user.email}: {data['role']}")
        
        return jsonify({
            'message': 'Role atualizado com sucesso',
            'user': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao atualizar role: {str(e)}")
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/health', methods=['GET'])
def health():
    """Health check do sistema de autenticação"""
    return jsonify({'status': 'ok', 'auth': 'ok'}), 200
