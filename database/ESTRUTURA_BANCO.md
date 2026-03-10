# 🗄️ Estrutura do Banco de Dados - Sistema Odontológico

## Diagrama de Relacionamento (ER)

```
┌─────────────────────────────────────┐
│           PATIENTS                  │
│─────────────────────────────────────│
│ 🔑 id (PK) - SERIAL                 │
│    name - VARCHAR(200) NOT NULL     │
│    email - VARCHAR(200)             │
│    phone - VARCHAR(20) NOT NULL     │
│    birth_date - DATE                │
│    cpf - VARCHAR(14) UNIQUE         │
│    address - TEXT                   │
│    health_plan - VARCHAR(100)       │
│    notes - TEXT                     │
│    created_at - TIMESTAMP           │
│    updated_at - TIMESTAMP           │
└─────────────────────────────────────┘
         │                    │
         │ 1:N                │ 1:N
         ▼                    ▼
┌─────────────────────┐  ┌─────────────────────┐
│   APPOINTMENTS      │  │   TRANSACTIONS      │
│─────────────────────│  │─────────────────────│
│ 🔑 id (PK)          │  │ 🔑 id (PK)          │
│ 🔗 patient_id (FK)  │  │ 🔗 patient_id (FK)  │
│    patient_name     │  │    type             │
│    patient_phone    │  │    category         │
│    patient_email    │  │    description      │
│    service          │  │    amount           │
│    date             │  │    date             │
│    time             │  │    payment_method   │
│    status           │  │    status           │
│    dentist          │  │    patient_name     │
│    value            │  │    notes            │
│    notes            │  │    created_at       │
│    created_at       │  │    updated_at       │
│    updated_at       │  └─────────────────────┘
└─────────────────────┘

┌─────────────────────────────────────┐
│             TASKS                   │
│─────────────────────────────────────│
│ 🔑 id (PK) - SERIAL                 │
│    title - VARCHAR(300) NOT NULL    │
│    date - DATE NOT NULL             │
│    status - VARCHAR(50)             │
│    priority - VARCHAR(20)           │
│    notes - TEXT                     │
│    created_at - TIMESTAMP           │
│    updated_at - TIMESTAMP           │
└─────────────────────────────────────┘
```

---

## 📋 Detalhamento das Tabelas

### 1. PATIENTS (Pacientes)

**Propósito:** Cadastro completo de pacientes do consultório

**Chave Primária:** `id` (auto-incremento)

**Campos Obrigatórios:**
- `name` - Nome completo
- `phone` - Telefone de contato

**Campos Únicos:**
- `cpf` - Não pode haver duplicados

**Índices:**
- `idx_patients_name` - Para busca por nome
- `idx_patients_phone` - Para busca por telefone
- `idx_patients_cpf` - Para busca por CPF

**Relacionamentos:**
- → appointments (1:N) - Um paciente pode ter vários agendamentos
- → transactions (1:N) - Um paciente pode ter várias transações

---

### 2. APPOINTMENTS (Agendamentos)

**Propósito:** Gerenciar consultas e procedimentos agendados

**Chave Primária:** `id` (auto-incremento)

**Chave Estrangeira:**
- `patient_id` → `patients(id)`
  - `ON DELETE SET NULL` - Se paciente for deletado, agendamento fica sem vínculo
  - `ON UPDATE CASCADE` - Se ID do paciente mudar, atualiza automaticamente

**Campos Obrigatórios:**
- `patient_name` - Nome (denormalizado para performance)
- `patient_phone` - Telefone
- `service` - Tipo de serviço
- `date` - Data do agendamento
- `time` - Horário

**Valores de Status:**
- `agendado` (padrão)
- `confirmado`
- `realizado`
- `cancelado`
- `faltou`

**Índices:**
- `idx_appointments_date` - Por data
- `idx_appointments_status` - Por status
- `idx_appointments_patient_id` - Por paciente
- `idx_appointments_date_time` - Combinado data+hora
- `idx_unique_appointment_time` - Evita conflitos de horário

---

### 3. TRANSACTIONS (Transações Financeiras)

**Propósito:** Controle de receitas e despesas

**Chave Primária:** `id` (auto-incremento)

**Chave Estrangeira:**
- `patient_id` → `patients(id)` (opcional)
  - `ON DELETE SET NULL`
  - `ON UPDATE CASCADE`

**Campos Obrigatórios:**
- `type` - Tipo (receita ou despesa)
- `category` - Categoria
- `description` - Descrição
- `amount` - Valor (não negativo)
- `date` - Data

**Constraints:**
- `type IN ('receita', 'despesa')` - Apenas esses valores
- `amount >= 0` - Valor não pode ser negativo

**Valores de Status:**
- `pendente` (padrão)
- `pago`
- `cancelado`

**Índices:**
- `idx_transactions_date` - Por data
- `idx_transactions_type` - Por tipo
- `idx_transactions_status` - Por status
- `idx_transactions_patient_id` - Por paciente
- `idx_transactions_date_type` - Combinado data+tipo

---

### 4. TASKS (Tarefas)

**Propósito:** Gerenciar tarefas e lembretes do consultório

**Chave Primária:** `id` (auto-incremento)

**Campos Obrigatórios:**
- `title` - Título da tarefa
- `date` - Data prevista

**Valores de Status:**
- `aberta` (padrão)
- `em_andamento`
- `concluida`
- `cancelada`

**Valores de Prioridade:**
- `baixa`
- `media` (padrão)
- `alta`

**Constraints:**
- Status limitado aos valores permitidos
- Prioridade limitada aos valores permitidos

**Índices:**
- `idx_tasks_date` - Por data
- `idx_tasks_status` - Por status
- `idx_tasks_priority` - Por prioridade

---

## 🔧 Funcionalidades Automáticas

### Triggers

**update_updated_at_column()**
- Atualiza automaticamente `updated_at` em todas as tabelas quando um registro é modificado
- Aplicado em: patients, appointments, transactions, tasks

### Views

**v_patient_summary**
```sql
-- Mostra resumo de cada paciente:
-- - Total de consultas
-- - Data da última consulta
-- - Total gasto
```

**v_financial_monthly**
```sql
-- Mostra resumo financeiro mensal:
-- - Total de receitas por mês
-- - Total de despesas por mês
-- - Quantidade de transações
```

---

## 📊 Tipos de Dados

### Tipo SERIAL
- Auto-incremento
- Usado em todas as chaves primárias
- PostgreSQL gera automaticamente os valores

### Tipo VARCHAR(n)
- Texto com tamanho máximo definido
- Exemplo: VARCHAR(200) = máximo 200 caracteres

### Tipo TEXT
- Texto sem limite de tamanho
- Usado para campos de observações/notas

### Tipo DATE
- Armazena apenas data (YYYY-MM-DD)
- Exemplo: 2026-03-15

### Tipo TIME
- Armazena apenas hora (HH:MM:SS)
- Exemplo: 14:30:00

### Tipo TIMESTAMP
- Armazena data e hora completas
- Exemplo: 2026-03-15 14:30:00

### Tipo NUMERIC(10,2)
- Números decimais com precisão
- 10 dígitos totais, 2 após a vírgula
- Exemplo: 12345678.90

---

## 🔑 Convenções de Nomenclatura

### Tabelas
- Plural em inglês
- Exemplo: `patients`, `appointments`

### Colunas
- Snake_case (palavras separadas por _)
- Exemplo: `patient_name`, `created_at`

### Chaves Primárias
- Sempre `id`
- Tipo SERIAL

### Chaves Estrangeiras
- Padrão: `<tabela>_id`
- Exemplo: `patient_id` referencia `patients(id)`

### Índices
- Padrão: `idx_<tabela>_<coluna(s)>`
- Exemplo: `idx_patients_name`

### Constraints
- Foreign Keys: `fk_<tabela>_<referencia>`
- Checks: `chk_<tabela>_<campo>`

---

## 📈 Performance

### Índices Criados

Total de **13 índices** para otimizar queries:

1. Busca de pacientes por nome, telefone, CPF
2. Busca de agendamentos por data, status, paciente
3. Busca de transações por data, tipo, status
4. Busca de tarefas por data, status, prioridade
5. Índice único para evitar conflitos de horário

### Denormalização

Alguns dados são **denormalizados** por performance:
- `appointments.patient_name` - Cópia do nome do paciente
- `appointments.patient_phone` - Cópia do telefone
- `transactions.patient_name` - Cópia do nome do paciente

**Vantagem:** Queries mais rápidas, não precisa fazer JOIN sempre
**Desvantagem:** Dados podem ficar desatualizados se paciente mudar dados

---

## 🛡️ Integridade de Dados

### Foreign Keys com CASCADE

**ON DELETE SET NULL:**
- Se um paciente for deletado, seus agendamentos/transações continuam existindo
- O campo `patient_id` fica NULL (órfão)
- Preserva histórico

**ON UPDATE CASCADE:**
- Se o ID de um paciente mudar, atualiza automaticamente todas as referências
- Mantém integridade

### Constraints (Restrições)

1. **NOT NULL** - Campo obrigatório
2. **UNIQUE** - Valor único no banco (ex: CPF)
3. **CHECK** - Validação de valor (ex: type IN ('receita', 'despesa'))
4. **FOREIGN KEY** - Garante relacionamento válido

### Valores Padrão

- `status` - Valores padrão configurados ('agendado', 'pendente', etc)
- `created_at` - Timestamp automático na criação
- `updated_at` - Atualizado automaticamente via trigger

---

## 💾 Tamanho Estimado

Com 1000 registros em cada tabela:
- **patients:** ~150 KB
- **appointments:** ~200 KB
- **transactions:** ~180 KB
- **tasks:** ~100 KB

**Total estimado:** ~630 KB (muito leve!)

Para 100.000 registros: ~63 MB (ainda muito leve)

---

## ✅ Checklist de Qualidade

- ✅ Chaves primárias em todas as tabelas
- ✅ Relacionamentos (Foreign Keys) configurados
- ✅ Índices para campos frequentemente consultados
- ✅ Constraints para validação de dados
- ✅ Triggers para manutenção automática
- ✅ Views para consultas frequentes
- ✅ Timestamps em todas as tabelas
- ✅ Comentários em tabelas e colunas
- ✅ Dados de exemplo para testes

---

## 🎯 Próximos Passos

1. **Criar o banco no DBeaver** seguindo [INSTRUCOES_DBEAVER.md](INSTRUCOES_DBEAVER.md)
2. **Executar script SQL** `create_tables.sql`
3. **Visualizar diagrama ER** no DBeaver
4. **Iniciar backend** Flask para conectar
5. **Testar integração** frontend + backend + banco
