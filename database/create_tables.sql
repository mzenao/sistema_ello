-- ============================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS
-- Sistema Odontológico
-- Execute este script após criar o banco e conectar nele
-- ============================================

-- ============================================
-- TABELA: patients (Pacientes)
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    cpf VARCHAR(14) UNIQUE,
    address TEXT,
    health_plan VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE patients IS 'Cadastro de pacientes do consultório';
COMMENT ON COLUMN patients.id IS 'Chave primária - ID único do paciente';
COMMENT ON COLUMN patients.name IS 'Nome completo do paciente';
COMMENT ON COLUMN patients.email IS 'Email de contato';
COMMENT ON COLUMN patients.phone IS 'Telefone principal (obrigatório)';
COMMENT ON COLUMN patients.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN patients.cpf IS 'CPF (único no sistema)';
COMMENT ON COLUMN patients.address IS 'Endereço completo';
COMMENT ON COLUMN patients.health_plan IS 'Plano de saúde (se tiver)';
COMMENT ON COLUMN patients.notes IS 'Observações gerais sobre o paciente';

-- Índices para melhorar performance
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_cpf ON patients(cpf);

-- ============================================
-- TABELA: appointments (Agendamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(200),
    service VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'agendado',
    dentist VARCHAR(200),
    value NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave estrangeira (relacionamento com pacientes)
    CONSTRAINT fk_appointment_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(id) 
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

COMMENT ON TABLE appointments IS 'Agendamentos e consultas';
COMMENT ON COLUMN appointments.id IS 'Chave primária - ID único do agendamento';
COMMENT ON COLUMN appointments.patient_id IS 'FK - Referência ao paciente (opcional)';
COMMENT ON COLUMN appointments.patient_name IS 'Nome do paciente (denormalizado para performance)';
COMMENT ON COLUMN appointments.service IS 'Tipo de serviço (consulta, clareamento, canal, etc)';
COMMENT ON COLUMN appointments.date IS 'Data do agendamento';
COMMENT ON COLUMN appointments.time IS 'Horário do agendamento';
COMMENT ON COLUMN appointments.status IS 'Status: agendado, confirmado, realizado, cancelado, faltou';
COMMENT ON COLUMN appointments.dentist IS 'Nome do dentista responsável';
COMMENT ON COLUMN appointments.value IS 'Valor do procedimento';

-- Índices
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date_time ON appointments(date, time);

-- Constraint para evitar conflitos de horário (opcional)
CREATE UNIQUE INDEX idx_unique_appointment_time 
    ON appointments(date, time, dentist) 
    WHERE status NOT IN ('cancelado', 'faltou');

-- ============================================
-- TABELA: transactions (Transações Financeiras)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('receita', 'despesa')),
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pendente',
    patient_id INTEGER,
    patient_name VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave estrangeira
    CONSTRAINT fk_transaction_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES patients(id) 
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

COMMENT ON TABLE transactions IS 'Movimentações financeiras (receitas e despesas)';
COMMENT ON COLUMN transactions.id IS 'Chave primária - ID único da transação';
COMMENT ON COLUMN transactions.type IS 'Tipo: receita ou despesa';
COMMENT ON COLUMN transactions.category IS 'Categoria (consulta, material, salário, etc)';
COMMENT ON COLUMN transactions.description IS 'Descrição da movimentação';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação';
COMMENT ON COLUMN transactions.date IS 'Data da transação';
COMMENT ON COLUMN transactions.payment_method IS 'Método: dinheiro, pix, cartão, etc';
COMMENT ON COLUMN transactions.status IS 'Status: pendente, pago, cancelado';
COMMENT ON COLUMN transactions.patient_id IS 'FK - Paciente relacionado (se aplicável)';

-- Índices
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_patient_id ON transactions(patient_id);
CREATE INDEX idx_transactions_date_type ON transactions(date, type);

-- ============================================
-- TABELA: tasks (Tarefas e Lembretes)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'aberta',
    priority VARCHAR(20) DEFAULT 'media',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_task_status CHECK (status IN ('aberta', 'em_andamento', 'concluida', 'cancelada')),
    CONSTRAINT chk_task_priority CHECK (priority IN ('baixa', 'media', 'alta'))
);

COMMENT ON TABLE tasks IS 'Tarefas e lembretes do consultório';
COMMENT ON COLUMN tasks.id IS 'Chave primária - ID único da tarefa';
COMMENT ON COLUMN tasks.title IS 'Título/descrição da tarefa';
COMMENT ON COLUMN tasks.date IS 'Data para execução';
COMMENT ON COLUMN tasks.status IS 'Status: aberta, em_andamento, concluida, cancelada';
COMMENT ON COLUMN tasks.priority IS 'Prioridade: baixa, media, alta';

-- Índices
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS ÚTEIS (Opcional)
-- ============================================

-- View de resumo de pacientes com total de consultas
CREATE OR REPLACE VIEW v_patient_summary AS
SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    COUNT(a.id) as total_appointments,
    MAX(a.date) as last_appointment_date,
    SUM(CASE WHEN a.status = 'realizado' THEN a.value ELSE 0 END) as total_spent
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name, p.phone, p.email;

COMMENT ON VIEW v_patient_summary IS 'Resumo de pacientes com estatísticas';

-- View de resumo financeiro por mês
CREATE OR REPLACE VIEW v_financial_monthly AS
SELECT 
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    type,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM transactions
WHERE status = 'pago'
GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), type
ORDER BY year DESC, month DESC;

COMMENT ON VIEW v_financial_monthly IS 'Resumo financeiro mensal';

-- ============================================
-- DADOS DE EXEMPLO (Opcional - Remover em produção)
-- ============================================

-- Inserir pacientes de exemplo
INSERT INTO patients (name, email, phone, birth_date, cpf, address, health_plan) VALUES
('Maria Clara Silva', 'maria.clara@email.com', '(32) 99999-1111', '1990-05-15', '111.222.333-44', 'Rua das Flores, 123 - Centro', 'Unimed'),
('João Pedro Santos', 'joao.pedro@email.com', '(32) 98888-2222', '1985-08-20', '222.333.444-55', 'Av. Principal, 456 - Bairro Novo', NULL),
('Ana Beatriz Costa', 'ana.beatriz@email.com', '(32) 97777-3333', '1995-12-10', '333.444.555-66', 'Rua do Comércio, 789', 'Bradesco Saúde');

-- Inserir agendamentos de exemplo
INSERT INTO appointments (patient_id, patient_name, patient_phone, service, date, time, status, dentist, value) VALUES
(1, 'Maria Clara Silva', '(32) 99999-1111', 'clareamento', '2026-03-15', '10:00', 'confirmado', 'Dr. Carlos', 900.00),
(2, 'João Pedro Santos', '(32) 98888-2222', 'canal', '2026-03-16', '14:30', 'agendado', 'Dra. Paula', 1200.00),
(3, 'Ana Beatriz Costa', '(32) 97777-3333', 'consulta', '2026-03-10', '09:00', 'realizado', 'Dr. Carlos', 150.00);

-- Inserir transações de exemplo
INSERT INTO transactions (type, category, description, amount, date, payment_method, status, patient_id, patient_name) VALUES
('receita', 'consulta', 'Consulta - Ana Beatriz', 150.00, '2026-03-10', 'pix', 'pago', 3, 'Ana Beatriz Costa'),
('despesa', 'material', 'Material odontológico - Fornecedor XYZ', 320.50, '2026-03-05', 'cartao', 'pago', NULL, NULL),
('despesa', 'salario', 'Salário - Recepcionista', 2500.00, '2026-03-01', 'pix', 'pago', NULL, NULL),
('receita', 'clareamento', 'Clareamento - João Silva', 850.00, '2026-03-08', 'dinheiro', 'pago', NULL, NULL);

-- Inserir tarefas de exemplo
INSERT INTO tasks (title, date, status, priority, notes) VALUES
('Conferir estoque de luvas e máscaras', '2026-03-12', 'aberta', 'alta', 'Verificar se precisa fazer pedido'),
('Ligar para fornecedor de material', '2026-03-13', 'em_andamento', 'media', NULL),
('Organizar arquivo de prontuários', '2026-03-14', 'aberta', 'baixa', NULL);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as tabelas criadas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar relacionamentos (Foreign Keys)
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
