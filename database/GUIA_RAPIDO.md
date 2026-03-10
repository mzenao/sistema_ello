# 🚀 GUIA RÁPIDO - Criar Banco no DBeaver

## 📋 CHECKLIST

- [ ] DBeaver instalado
- [ ] PostgreSQL rodando
- [ ] Senha do postgres em mãos

---

## ⚡ PASSO A PASSO RÁPIDO

### 1️⃣ Conectar ao PostgreSQL no DBeaver

```
Nova Conexão → PostgreSQL
Host: localhost
Port: 5432
Database: postgres  
User: postgres
Password: [sua senha]
→ Test Connection → Finish
```

### 2️⃣ Criar o Banco

**Via Interface (mais fácil):**
```
Botão direito em Databases 
→ Create New Database
→ Nome: sistema_odontologico
→ OK
```

**Ou via SQL:**
```sql
CREATE DATABASE sistema_odontologico;
```

### 3️⃣ Conectar ao Novo Banco

```
Botão direito na conexão
→ Edit Connection
→ Mudar Database de "postgres" para "sistema_odontologico"
→ Test Connection → OK
```

### 4️⃣ Executar Script SQL

```
Botão direito no banco sistema_odontologico
→ SQL Editor → Open SQL Script
→ Abrir: database/create_tables.sql
→ Execute SQL Script (F5)
→ Aguardar conclusão
```

### 5️⃣ Verificar

```
Expandir: sistema_odontologico → Schemas → public → Tables
```

Deve ver:
- ✅ patients
- ✅ appointments  
- ✅ transactions
- ✅ tasks

---

## 🔍 VERIFICAR RELACIONAMENTOS

```
Botão direito no banco
→ View Diagram
```

Ou selecionar todas as tabelas e:
```
Botão direito → View Diagram
```

---

## 🎯 RESULTADO ESPERADO

**4 tabelas criadas:**
1. patients (3 registros de exemplo)
2. appointments (3 registros de exemplo)
3. transactions (4 registros de exemplo)
4. tasks (3 registros de exemplo)

**Relacionamentos:**
- patients ← appointments (FK)
- patients ← transactions (FK)

**Extras:**
- 13 índices criados
- 4 triggers configurados
- 2 views criadas

---

## ✅ TESTAR

Execute no SQL Editor:

```sql
-- Ver dados de pacientes
SELECT * FROM patients;

-- Ver agendamentos com nome do paciente
SELECT 
    a.id,
    a.patient_name,
    a.service,
    a.date,
    a.time,
    a.status
FROM appointments a
ORDER BY a.date, a.time;

-- Ver resumo financeiro
SELECT 
    type,
    COUNT(*) as qtd,
    SUM(amount) as total
FROM transactions
GROUP BY type;

-- Ver tarefas pendentes
SELECT * FROM tasks 
WHERE status = 'aberta' 
ORDER BY priority DESC, date;
```

---

## 🐛 PROBLEMAS COMUNS

### Erro: database already exists
✅ **OK!** Banco já foi criado, vá para Passo 3

### Erro: relation already exists  
✅ **OK!** Tabelas já foram criadas

### Não vejo as tabelas
🔄 Clique com botão direito na conexão → **Refresh** (F5)

### Erro de conexão
🔍 Verificar:
- PostgreSQL está rodando?
- Senha está correta?
- Port 5432 está livre?

---

## 📁 ARQUIVOS DISPONÍVEIS

```
database/
├── create_database.sql      ← Criar banco
├── create_tables.sql        ← Criar tabelas (USAR ESTE)
├── INSTRUCOES_DBEAVER.md    ← Guia detalhado
├── ESTRUTURA_BANCO.md       ← Documentação completa
└── GUIA_RAPIDO.md          ← Este arquivo
```

---

## 🎯 PRÓXIMO PASSO

Com o banco criado, iniciar o backend:

```powershell
cd backend
.\venv\Scripts\activate   # Se já criou o venv
pip install -r requirements.txt
copy .env.example .env
python run.py
```

Testar: http://localhost:5000/api/health

---

## 📞 QUERIES ÚTEIS

### Ver todas as tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Ver Foreign Keys
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Contar registros
```sql
SELECT 
    'patients' as tabela, COUNT(*) FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL  
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks;
```

---

## 💡 DICAS

### Visualizar Dados
```
Botão direito na tabela → View Data
```

### Editar Dados
```
View Data → Editar células → Salvar (Ctrl+S)
```

### Exportar Dados
```
Botão direito na tabela → Export Data
```

### Importar Dados
```
Botão direito na tabela → Import Data
```

### Backup
```
Botão direito no banco → Tools → Backup
```

---

**🎉 Pronto! Banco estruturado e funcionando!**
