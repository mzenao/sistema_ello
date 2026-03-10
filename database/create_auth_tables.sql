-- ============ TABELA DE USUÁRIOS COM AUTENTICAÇÃO SEGURA ============

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABELA DE TOKENS/SESSÕES ============
CREATE TABLE IF NOT EXISTS auth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ÍNDICES PARA PERFORMANCE ============
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- ============ EXPLICAÇÃO DOS CAMPOS ============
-- users:
--   id: ID único da tabela
--   email: Email único (login)
--   name: Nome do usuário
--   password_hash: Hash da senha (NUNCA armazenar senha em texto plano)
--   role: Papel do usuário (user, dentist, admin)
--   is_active: Usuário ativo ou não (para desativar sem deletar)
--   created_at: Data de criação
--   updated_at: Data da última atualização

-- auth_tokens:
--   id: ID único
--   user_id: Referência ao usuário
--   token: JWT ou token seguro
--   expires_at: Quando o token expira
--   created_at: Quando foi criado

-- ============ SEGURANÇA IMPLEMENTADA ============
-- 1. Email único - evita duplicatas
-- 2. Password hash - usa bcrypt (nunca texto plano)
-- 3. Tokens com expiração
-- 4. Índices para consultas rápidas
-- 5. Role-based access control (RBAC)
-- 6. Soft delete com is_active
