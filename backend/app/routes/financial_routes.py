from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.financial import Transaction, Task, transaction_schema, transactions_schema, task_schema, tasks_schema
from app.auth import token_required
from datetime import datetime
from sqlalchemy import func, extract

financial_bp = Blueprint('financial', __name__)


# ============ TRANSAÇÕES ============

@financial_bp.route('/transactions', methods=['GET'])
@token_required
def list_transactions():
    """Listar todas as transações (requer autenticação)"""
    try:
        # Filtros opcionais
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        type_filter = request.args.get('type')
        
        query = Transaction.query
        
        if date_from:
            query = query.filter(Transaction.date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(Transaction.date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        if type_filter:
            query = query.filter(Transaction.type == type_filter)
        
        transactions = query.order_by(Transaction.date.desc()).all()
        return jsonify(transactions_schema.dump(transactions)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/transactions/<int:id>', methods=['GET'])
@token_required
def get_transaction(id):
    """Buscar transação por ID (requer autenticação)"""
    try:
        transaction = Transaction.query.get_or_404(id)
        return jsonify(transaction_schema.dump(transaction)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@financial_bp.route('/transactions', methods=['POST'])
@token_required
def create_transaction():
    """Criar nova transação (requer autenticação)"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('type'):
            return jsonify({'error': 'Tipo é obrigatório (receita ou despesa)'}), 400
        if not data.get('description'):
            return jsonify({'error': 'Descrição é obrigatória'}), 400
        if not data.get('amount'):
            return jsonify({'error': 'Valor é obrigatório'}), 400
        if not data.get('date'):
            return jsonify({'error': 'Data é obrigatória'}), 400
        if not data.get('category'):
            return jsonify({'error': 'Categoria é obrigatória'}), 400
        
        # Converter data
        try:
            data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Data em formato inválido'}), 400
        
        transaction = Transaction(**data)
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify(transaction_schema.dump(transaction)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/transactions/<int:id>', methods=['PUT'])
@token_required
def update_transaction(id):
    """Atualizar transação existente (requer autenticação)"""
    try:
        transaction = Transaction.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        if 'type' in data:
            transaction.type = data['type']
        if 'category' in data:
            transaction.category = data['category']
        if 'description' in data:
            transaction.description = data['description']
        if 'amount' in data:
            transaction.amount = data['amount']
        if 'payment_method' in data:
            transaction.payment_method = data['payment_method']
        if 'status' in data:
            transaction.status = data['status']
        if 'patient_name' in data:
            transaction.patient_name = data['patient_name']
        if 'notes' in data:
            transaction.notes = data['notes']
        if 'date' in data and data['date']:
            try:
                transaction.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data inválida'}), 400
        
        db.session.commit()
        return jsonify(transaction_schema.dump(transaction)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/transactions/<int:id>', methods=['DELETE'])
@token_required
def delete_transaction(id):
    """Deletar transação (requer autenticação)"""
    try:
        transaction = Transaction.query.get_or_404(id)
        db.session.delete(transaction)
        db.session.commit()
        return jsonify({'message': 'Transação deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/summary', methods=['GET'])
@token_required
def get_financial_summary():
    """Obter resumo financeiro (requer autenticação)"""
    try:
        # Filtros opcionais
        month = request.args.get('month')
        year = request.args.get('year')
        
        query = Transaction.query
        
        if month and year:
            query = query.filter(
                extract('month', Transaction.date) == int(month),
                extract('year', Transaction.date) == int(year)
            )
        
        # Calcular totais
        receitas = query.filter(Transaction.type == 'receita').with_entities(
            func.sum(Transaction.amount)
        ).scalar() or 0
        
        despesas = query.filter(Transaction.type == 'despesa').with_entities(
            func.sum(Transaction.amount)
        ).scalar() or 0
        
        saldo = float(receitas) - float(despesas)
        
        return jsonify({
            'receitas': float(receitas),
            'despesas': float(despesas),
            'saldo': saldo
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ TAREFAS ============

@financial_bp.route('/tasks', methods=['GET'])
@token_required
def list_tasks():
    """Listar todas as tarefas (requer autenticação)"""
    try:
        # Filtros opcionais
        status = request.args.get('status')
        date = request.args.get('date')
        
        query = Task.query
        
        if status:
            query = query.filter(Task.status == status)
        if date:
            query = query.filter(Task.date == datetime.strptime(date, '%Y-%m-%d').date())
        
        tasks = query.order_by(Task.date.desc(), Task.priority).all()
        return jsonify(tasks_schema.dump(tasks)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/tasks/<int:id>', methods=['GET'])
@token_required
def get_task(id):
    """Buscar tarefa por ID (requer autenticação)"""
    try:
        task = Task.query.get_or_404(id)
        return jsonify(task_schema.dump(task)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@financial_bp.route('/tasks', methods=['POST'])
@token_required
def create_task():
    """Criar nova tarefa (requer autenticação)"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('title'):
            return jsonify({'error': 'Título é obrigatório'}), 400
        if not data.get('date'):
            return jsonify({'error': 'Data é obrigatória'}), 400
        
        # Converter data
        try:
            data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Data em formato inválido'}), 400
        
        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        
        return jsonify(task_schema.dump(task)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/tasks/<int:id>', methods=['PUT'])
@token_required
def update_task(id):
    """Atualizar tarefa existente (requer autenticação)"""
    try:
        task = Task.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        if 'title' in data:
            task.title = data['title']
        if 'status' in data:
            task.status = data['status']
        if 'priority' in data:
            task.priority = data['priority']
        if 'notes' in data:
            task.notes = data['notes']
        if 'date' in data and data['date']:
            try:
                task.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data inválida'}), 400
        
        db.session.commit()
        return jsonify(task_schema.dump(task)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@financial_bp.route('/tasks/<int:id>', methods=['DELETE'])
@token_required
def delete_task(id):
    """Deletar tarefa (requer autenticação)"""
    try:
        task = Task.query.get_or_404(id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Tarefa deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============ EVENTOS DO CALENDÁRIO ============

@financial_bp.route('/calendar-events', methods=['GET'])
def get_calendar_events():
    """Retornar todos os eventos para o calendário (transações + tarefas)"""
    try:
        month = request.args.get('month')
        year = request.args.get('year')
        
        events = []
        
        # Buscar transações
        trans_query = Transaction.query
        if month and year:
            trans_query = trans_query.filter(
                extract('month', Transaction.date) == int(month),
                extract('year', Transaction.date) == int(year)
            )
        transactions = trans_query.all()
        
        for trans in transactions:
            events.append({
                'id': f'b{trans.id}',
                'type': 'bill',
                'date': trans.date.strftime('%Y-%m-%d'),
                'title': trans.description,
                'status': trans.status,
                'amount': float(trans.amount)
            })
        
        # Buscar tarefas
        task_query = Task.query
        if month and year:
            task_query = task_query.filter(
                extract('month', Task.date) == int(month),
                extract('year', Task.date) == int(year)
            )
        tasks = task_query.all()
        
        for task in tasks:
            events.append({
                'id': f't{task.id}',
                'type': 'task',
                'date': task.date.strftime('%Y-%m-%d'),
                'title': task.title,
                'status': task.status
            })
        
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
