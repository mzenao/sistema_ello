# 📘 Como Criar o Banco no DBeaver

## Passo 1: Conectar ao PostgreSQL

1. Abra o **DBeaver**
2. Clique em **Nova Conexão** (ícone de tomada com +)
3. Selecione **PostgreSQL**
4. Configure:
   ```
   Host: localhost
   Port: 5432
   Database: postgres (conectar no banco padrão primeiro)
   Username: postgres
   Password: [sua senha do postgres]
   ```
5. Clique em **Testar Conexão** para verificar
6. Clique em **Concluir**

---

## Passo 2: Criar o Banco de Dados

### Opção A - Via Interface Gráfica (mais fácil)

1. Na árvore de conexões, expanda sua conexão PostgreSQL
2. Clique com botão direito em **Databases**
3. Selecione **Create New Database**
4. Preencha:
   ```
   Database name: sistema_odontologico
   Owner: postgres
   Encoding: UTF8
   ```
5. Clique em **OK**

### Opção B - Via SQL (mais controle)

1. Clique com botão direito na conexão
2. Selecione **SQL Editor** → **New SQL Script**
3. Abra o arquivo `database/create_database.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor do DBeaver
6. Clique em **Execute SQL Statement** (Ctrl + Enter)

---

## Passo 3: Conectar ao Novo Banco

1. Clique com botão direito na sua conexão PostgreSQL
2. Selecione **Edit Connection**
3. Mude o campo **Database** de `postgres` para `sistema_odontologico`
4. Clique em **Test Connection**
5. Clique em **OK**

OU

1. Crie uma nova conexão específica para o banco `sistema_odontologico`
2. Use as mesmas credenciais, mas com `Database: sistema_odontologico`

---

## Passo 4: Criar as Tabelas

1. Com o banco `sistema_odontologico` selecionado
2. Clique com botão direito no banco
3. Selecione **SQL Editor** → **Open SQL Script**
4. Navegue até `database/create_tables.sql`
5. Clique em **Execute SQL Script** (ou F5)
6. Aguarde a execução (pode levar alguns segundos)

Você verá mensagens como:
```
✓ CREATE TABLE
✓ CREATE INDEX
✓ CREATE TRIGGER
✓ INSERT 0 3
```

---

## Passo 5: Verificar a Estrutura

### Ver Tabelas Criadas

1. Na árvore, expanda:
   ```
   sistema_odontologico → Schemas → public → Tables
   ```
2. Você verá:
   - ✓ patients
   - ✓ appointments
   - ✓ transactions
   - ✓ tasks

### Ver Estrutura de uma Tabela

1. Clique com botão direito em uma tabela (ex: `patients`)
2. Selecione **View Table**
3. Vá na aba **Columns** para ver colunas
4. Vá na aba **Foreign Keys** para ver relacionamentos
5. Vá na aba **Indexes** para ver índices

### Visualizar Relacionamentos (Diagrama ER)

1. Clique com botão direito no banco `sistema_odontologico`
2. Selecione **View Diagram**
3. DBeaver mostrará o diagrama com todas as tabelas e relacionamentos

Ou:

1. Selecione todas as 4 tabelas (Ctrl + Click)
2. Clique com botão direito
3. Selecione **View Diagram**

---

## Passo 6: Verificar Dados de Exemplo

1. Clique com botão direito em `patients`
2. Selecione **View Data**
3. Você verá 3 pacientes de exemplo

Faça o mesmo para as outras tabelas para ver os dados inseridos.

---

## Passo 7: Executar Queries de Verificação

Abra um novo SQL Editor e execute:

### Ver todas as tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
```

### Ver relacionamentos (Foreign Keys)
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';
```

### Contar registros em cada tabela
```sql
SELECT 
    'patients' as table_name, COUNT(*) as records FROM patients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks;
```

---

## Estrutura do Banco Criado

### 📋 Tabelas

1. **patients** (Pacientes)
   - PK: `id` (SERIAL)
   - Campos: name, email, phone, birth_date, cpf (UNIQUE), address, health_plan, notes
   - Índices: name, phone, cpf

2. **appointments** (Agendamentos)
   - PK: `id` (SERIAL)
   - FK: `patient_id` → patients(id)
   - Campos: patient_name, patient_phone, service, date, time, status, dentist, value, notes
   - Índices: date, status, patient_id, date+time

3. **transactions** (Transações)
   - PK: `id` (SERIAL)
   - FK: `patient_id` → patients(id)
   - Campos: type (receita/despesa), category, description, amount, date, payment_method, status, notes
   - Índices: date, type, status, patient_id

4. **tasks** (Tarefas)
   - PK: `id` (SERIAL)
   - Campos: title, date, status, priority, notes
   - Índices: date, status, priority

### 🔗 Relacionamentos

```
patients (1) ──── (N) appointments
   └─────────────────── (N) transactions
```

- Um paciente pode ter vários agendamentos
- Um paciente pode ter várias transações
- Os relacionamentos são SET NULL (se deletar paciente, os registros ficam órfãos)

### 📊 Views Criadas

- `v_patient_summary` - Resumo de pacientes com estatísticas
- `v_financial_monthly` - Resumo financeiro mensal

### ⚙️ Triggers

- `update_updated_at` - Atualiza automaticamente o campo `updated_at` em todas as tabelas

---

## ✅ Checklist de Verificação

- [ ] Banco `sistema_odontologico` criado
- [ ] 4 tabelas criadas (patients, appointments, transactions, tasks)
- [ ] Relacionamentos (Foreign Keys) configurados
- [ ] Índices criados para performance
- [ ] Triggers de updated_at funcionando
- [ ] Views criadas
- [ ] Dados de exemplo inseridos
- [ ] Diagrama ER visualizado no DBeaver

---

## 🎯 Próximo Passo

Agora que o banco está criado, você pode:

1. **Iniciar o Backend:**
   ```powershell
   cd backend
   .\venv\Scripts\activate
   python run.py
   ```

2. **Testar a Conexão:**
   - Abra http://localhost:5000/api/health
   - Deve retornar: `{"status": "ok"}`

3. **Verificar Dados:**
   - http://localhost:5000/api/patients
   - http://localhost:5000/api/appointments

---

## 🐛 Troubleshooting

### Erro: permission denied to create database
**Solução:** Certifique-se de estar conectado como usuário `postgres` ou outro com permissões de criar banco.

### Erro: database already exists
**Solução:** O banco já foi criado. Pule para o Passo 3.

### Erro: relation already exists
**Solução:** As tabelas já foram criadas. Se quiser recriar:
```sql
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
```
Depois execute o script `create_tables.sql` novamente.

### Não vejo as tabelas no DBeaver
**Solução:** 
1. Clique com botão direito na conexão
2. Selecione **Refresh**
3. Ou pressione F5

---

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [DBeaver Documentation](https://dbeaver.io/docs/)
- Script SQL completo: `database/create_tables.sql`
