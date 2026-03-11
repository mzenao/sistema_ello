# Sistema Odontologico

Aplicacao web para gestao de clinica odontologica, com frontend em React e backend em Flask.

## Objetivo

Centralizar operacoes de pacientes, agendamentos, equipe, financeiro e autenticacao em uma unica plataforma.

## Stack Tecnologica

- Frontend: React 19, Vite, Tailwind CSS, React Router, Recharts
- Backend: Flask 3, Flask-SQLAlchemy, Marshmallow, Flask-Migrate, Flask-CORS
- Banco de dados: PostgreSQL

## Estrutura do Projeto

backend/    API REST e regras de negocio
frontend/   Interface web
database/   Scripts SQL e documentacao do banco
docs/       Documentacao complementar

## Requisitos

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+

## Configuracao Rapida

### 1. Banco de dados

Crie o banco no PostgreSQL:


CREATE DATABASE sistema_odontologico;


### 2. Backend

No diretorio raiz do workspace:


python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
copy backend\.env.example backend\.env


Edite `backend/.env`:

DATABASE_URL=postgresql+psycopg://postgres:SUA_SENHA@localhost:5432/sistema_odontologico
SECRET_KEY=troque-esta-chave-em-producao
FLASK_ENV=development
PORT=5000

Inicialize o banco e dados de autenticacao:

python backend\scripts\init_db.py
python backend\scripts\seed_auth_users.py


Inicie a API:

python backend\run.py


API disponivel em `http://localhost:5000`.

### 3. Frontend

Em outro terminal:

cd frontend
npm install
npm run dev

Frontend disponivel em `http://localhost:5173`.

## Credenciais Iniciais

Criadas por `backend/scripts/seed_auth_users.py`:

- Email: `admin@odonto.com`
- Senha: `admin`

## Modulos da API

- `GET /api/health`: status geral da API
- `POST /api/auth/login`: autenticacao e emissao de token
- `GET|POST|PUT|DELETE /api/patients`: cadastro de pacientes
- `GET|POST|PUT|DELETE /api/workers`: cadastro de funcionarios
- `GET|POST|PUT|DELETE /api/appointments`: agendamentos
- `GET|POST|PUT|DELETE /api/financial/transactions`: transacoes
- `GET|POST|PUT|DELETE /api/financial/tasks`: tarefas
- `GET /api/financial/summary`: resumo financeiro

Observacao: parte das rotas exige token no header `Authorization: Bearer <token>`.
