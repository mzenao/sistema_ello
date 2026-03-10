from functools import wraps
from flask import request, jsonify
from app.models.users import User, AuthToken
from datetime import datetime


def token_required(f):
    """Decorador para proteger rotas - requer autenticação via token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se o token foi enviado no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Formato de token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token ausente. Autenticação necessária'}), 401
        
        try:
            # Buscar token no banco de dados
            auth_token = AuthToken.query.filter_by(token=token).first()
            
            if not auth_token:
                return jsonify({'error': 'Token inválido'}), 401
            
            # Verificar se o token ainda é válido
            if not auth_token.is_valid():
                return jsonify({'error': 'Token expirado'}), 401
            
            # Verificar se o usuário está ativo
            user = auth_token.user
            if not user or not user.is_active:
                return jsonify({'error': 'Usuário inativo ou inexistente'}), 401
            
            # Adicionar usuário ao contexto da requisição
            request.current_user = user
            
        except Exception as e:
            return jsonify({'error': f'Erro na validação do token: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorador para proteger rotas - requer autenticação e role admin"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Formato de token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token ausente. Autenticação necessária'}), 401
        
        try:
            auth_token = AuthToken.query.filter_by(token=token).first()
            
            if not auth_token or not auth_token.is_valid():
                return jsonify({'error': 'Token inválido ou expirado'}), 401
            
            user = auth_token.user
            if not user or not user.is_active:
                return jsonify({'error': 'Usuário inativo ou inexistente'}), 401
            
            # Verificar se é admin
            if user.role != 'admin':
                return jsonify({'error': 'Acesso necessário de administrador'}), 403
            
            request.current_user = user
            
        except Exception as e:
            return jsonify({'error': f'Erro na validação: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    
    return decorated
