from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.appointment import Appointment, appointment_schema, appointments_schema
from app.auth import token_required
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('', methods=['GET'])
@token_required
def list_appointments():
    """Listar todos os agendamentos (requer autenticação)"""
    try:
        # Filtros opcionais
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        status = request.args.get('status')
        
        query = Appointment.query
        
        if date_from:
            query = query.filter(Appointment.date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(Appointment.date <= datetime.strptime(date_to, '%Y-%m-%d').date())
        if status:
            query = query.filter(Appointment.status == status)
        
        appointments = query.order_by(Appointment.date, Appointment.time).all()
        return jsonify(appointments_schema.dump(appointments)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@appointments_bp.route('/<int:id>', methods=['GET'])
def get_appointment(id):
    """Buscar agendamento por ID"""
    try:
        appointment = Appointment.query.get_or_404(id)
        return jsonify(appointment_schema.dump(appointment)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@appointments_bp.route('', methods=['POST'])
def create_appointment():
    """Criar novo agendamento - PÚBLICO (sem autenticação necessária)"""
    try:
        data = request.get_json()
        
        # Log dos dados recebidos
        logger.info(f"Recebido pedido de agendamento: {data}")
        
        # Validações
        if not data.get('patient_name'):
            return jsonify({'error': 'Nome do paciente é obrigatório'}), 400
        if not data.get('patient_phone'):
            return jsonify({'error': 'Telefone é obrigatório'}), 400
        if not data.get('date'):
            return jsonify({'error': 'Data é obrigatória'}), 400
        if not data.get('time'):
            return jsonify({'error': 'Horário é obrigatório'}), 400
        if not data.get('service'):
            return jsonify({'error': 'Serviço é obrigatório'}), 400
        
        # Converter data e hora
        try:
            data['date'] = datetime.strptime(data['date'], '%Y-%m-%d').date()
            data['time'] = datetime.strptime(data['time'], '%H:%M').time()
        except ValueError as e:
            logger.error(f"Erro ao converter data/hora: {e}")
            return jsonify({'error': 'Data ou hora em formato inválido (use YYYY-MM-DD e HH:MM)'}), 400
        
        # Remover campos que não existem no modelo
        allowed_fields = ['patient_name', 'patient_phone', 'patient_email', 'service', 'date', 'time', 'status', 'dentist', 'value', 'notes']
        data = {k: v for k, v in data.items() if k in allowed_fields}
        
        appointment = Appointment(**data)
        db.session.add(appointment)
        db.session.commit()
        
        logger.info(f"Agendamento criado com sucesso: ID {appointment.id}")
        return jsonify(appointment_schema.dump(appointment)), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao criar agendamento: {str(e)}", exc_info=True)
        return jsonify({'error': f'Erro ao criar agendamento: {str(e)}'}), 500


@appointments_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_appointment(id):
    """Atualizar agendamento existente (requer autenticação)"""
    try:
        appointment = Appointment.query.get_or_404(id)
        data = request.get_json()
        
        # Atualizar campos
        if 'patient_name' in data:
            appointment.patient_name = data['patient_name']
        if 'patient_phone' in data:
            appointment.patient_phone = data['patient_phone']
        if 'patient_email' in data:
            appointment.patient_email = data['patient_email']
        if 'service' in data:
            appointment.service = data['service']
        if 'status' in data:
            appointment.status = data['status']
        if 'dentist' in data:
            appointment.dentist = data['dentist']
        if 'value' in data:
            appointment.value = data['value']
        if 'notes' in data:
            appointment.notes = data['notes']
        if 'date' in data and data['date']:
            try:
                appointment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Data inválida'}), 400
        if 'time' in data and data['time']:
            try:
                appointment.time = datetime.strptime(data['time'], '%H:%M').time()
            except ValueError:
                return jsonify({'error': 'Hora inválida'}), 400
        
        db.session.commit()
        return jsonify(appointment_schema.dump(appointment)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@appointments_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_appointment(id):
    """Deletar agendamento (requer autenticação)"""
    try:
        appointment = Appointment.query.get_or_404(id)
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({'message': 'Agendamento deletado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@appointments_bp.route('/calendar', methods=['GET'])
def get_calendar_events():
    """Retornar eventos do calendário (agendamentos + tarefas)"""
    try:
        # Filtrar por mês/ano se fornecido
        month = request.args.get('month')
        year = request.args.get('year')
        
        query = Appointment.query
        
        if month and year:
            from datetime import date
            start_date = date(int(year), int(month), 1)
            # Último dia do mês
            if int(month) == 12:
                end_date = date(int(year) + 1, 1, 1)
            else:
                end_date = date(int(year), int(month) + 1, 1)
            
            query = query.filter(Appointment.date >= start_date, Appointment.date < end_date)
        
        appointments = query.order_by(Appointment.date, Appointment.time).all()
        
        # Formatar para o frontend
        events = []
        for apt in appointments:
            events.append({
                'id': f'a{apt.id}',
                'type': 'appointment',
                'date': apt.date.strftime('%Y-%m-%d'),
                'time': apt.time.strftime('%H:%M'),
                'title': f'{apt.service.title()} · {apt.patient_name}',
                'status': apt.status,
                'meta': {
                    'phone': apt.patient_phone,
                    'service': apt.service
                }
            })
        
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
