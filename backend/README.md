# Backend - Sistema Odontológico

API REST desenvolvida em Flask + PostgreSQL para gerenciar consultório odontológico.

## 📋 Pré-requisitos

- Python 3.8+
- PostgreSQL 12+
- pip

## 🚀 Instalação e Configuração

### 1. Criar ambiente virtual

```powershell
# Windows
cd backend
python -m venv venv
.\venv\Scripts\activate
```

### 2. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 3. Configurar PostgreSQL

#### Opção A - Instalar PostgreSQL localmente

1. Baixe e instale: https://www.postgresql.org/download/windows/
2. Durante instalação, anote a senha do usuário `postgres`
3. Após instalação, crie o banco de dados:

```powershell
# Abrir psql (prompt do PostgreSQL)
psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE sistema_odontologico;
\q
```

#### Opção B - Usar PostgreSQL via Docker

```powershell
docker run --name postgres-odonto -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sistema_odontologico -p 5432:5432 -d postgres:15
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
copy .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/sistema_odontologico
SECRET_KEY=sua-chave-secreta-aleatoria
FLASK_ENV=development
PORT=5000
```

### 5. Inicializar banco de dados

```powershell
# Criar tabelas e adicionar dados de exemplo
python scripts/init_db.py
```

### 6. Executar a aplicação

```powershell
python run.py
```

A API estará disponível em: `http://localhost:5000`

## 📡 Endpoints da API

### Health Check
- `GET /api/health` - Verificar se a API está funcionando

### Pacientes
- `GET /api/patients` - Listar todos os pacientes
- `GET /api/patients/<id>` - Buscar paciente por ID
- `POST /api/patients` - Criar novo paciente
- `PUT /api/patients/<id>` - Atualizar paciente
- `DELETE /api/patients/<id>` - Deletar paciente
- `GET /api/patients/search?q=termo` - Buscar pacientes

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/<id>` - Buscar agendamento por ID
- `POST /api/appointments` - Criar agendamento
- `PUT /api/appointments/<id>` - Atualizar agendamento
- `DELETE /api/appointments/<id>` - Deletar agendamento
- `GET /api/appointments/calendar?month=3&year=2026` - Eventos do calendário

### Financeiro - Transações
- `GET /api/financial/transactions` - Listar transações
- `GET /api/financial/transactions/<id>` - Buscar transação
- `POST /api/financial/transactions` - Criar transação
- `PUT /api/financial/transactions/<id>` - Atualizar transação
- `DELETE /api/financial/transactions/<id>` - Deletar transação
- `GET /api/financial/summary?month=3&year=2026` - Resumo financeiro

### Financeiro - Tarefas
- `GET /api/financial/tasks` - Listar tarefas
- `GET /api/financial/tasks/<id>` - Buscar tarefa
- `POST /api/financial/tasks` - Criar tarefa
- `PUT /api/financial/tasks/<id>` - Atualizar tarefa
- `DELETE /api/financial/tasks/<id>` - Deletar tarefa

### Calendário
- `GET /api/financial/calendar-events?month=3&year=2026` - Todos eventos (transações + tarefas)

## 🗄️ Estrutura do Banco

### Tabelas principais:
- **patients** - Cadastro de pacientes
- **appointments** - Agendamentos
- **transactions** - Movimentações financeiras (receitas/despesas)
- **tasks** - Tarefas e lembretes

## 🛠️ Comandos úteis

```powershell
# Ativar ambiente virtual
.\venv\Scripts\activate

# Instalar nova dependência
pip install nome-pacote
pip freeze > requirements.txt

# Executar em modo debug
python run.py

# Ver logs do banco (opcional)
# No config.py, mude SQLALCHEMY_ECHO = True
```

## 🔧 Troubleshooting

### Erro de conexão com PostgreSQL
- Verificar se o PostgreSQL está rodando
- Confirmar usuário/senha no arquivo `.env`
- Verificar se o banco foi criado

### Erro de módulo não encontrado
```powershell
pip install -r requirements.txt
```

### Resetar banco de dados
```powershell
python scripts/init_db.py
```

## 📝 Próximos Passos

1. ✅ Backend configurado
2. ✅ Banco de dados criado
3. 🔄 Conectar frontend com backend
4. 🔄 Testar integração completa
