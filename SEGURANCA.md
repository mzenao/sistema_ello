## SEGURANÇA IMPLEMENTADA - Sistema Odontológico

### 1. TABELAS DE AUTENTICAÇÃO (SQL)

Arquivo: [database/create_auth_tables.sql](database/create_auth_tables.sql)

**Tabelas criadas:**
- `users` - Dados dos usuários com hashing de senha
- `auth_tokens` - Tokens JWT com expiração

**Recursos:**
- ✅ Código hash de senha com PBKDF2-SHA256
- ✅ Tokens únicos com expiração de 24h
- ✅ Índices para performance
- ✅ Soft delete com `is_active`
- ✅ Role-based access control (user, dentist, admin)

---

### 2. ROTAS DE AUTENTICAÇÃO

**Endpoint:** `/api/auth`

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| POST | `/register` | ❌ Público | Registrar novo usuário |
| POST | `/login` | ❌ Público | Fazer login e obter token |
| POST | `/logout` | ✅ Privado | Logout e invalidar token |
| GET | `/me` | ✅ Privado | Obter dados do usuário autenticado |
| POST | `/refresh-token` | ✅ Privado | Renovar token (nova sessão 24h) |
| GET | `/users` | 👑 Admin | Listar todos os usuários |
| PUT | `/users/<id>/role` | 👑 Admin | Mudar role de um usuário |

---

### 3. ROTAS PROTEGIDAS

#### 🟢 PACIENTES (`/api/patients`)
- GET / - ✅ Privado
- POST / - ✅ Privado
- GET/<id> - ✅ Privado
- PUT/<id> - ✅ Privado
- DELETE/<id> - ✅ Privado
- GET/search - ✅ Privado

#### 🟢 AGENDAMENTOS (`/api/appointments`)
- GET / - ✅ Privado (listar todos)
- **POST / - ❌ PÚBLICO** (novo agendamento do site)
- GET/<id> - ❌ Público (cliente ver status)
- PUT/<id> - ✅ Privado
- DELETE/<id> - ✅ Privado

#### 🟢 FUNCIONÁRIOS (`/api/workers`)
- GET / - ✅ Privado
- POST / - ✅ Privado
- GET/<id> - ✅ Privado
- PUT/<id> - ✅ Privado
- DELETE/<id> - ✅ Privado

#### 🟢 FINANCEIRO (`/api/financial`)
- GET /transactions - ✅ Privado
- POST /transactions - ✅ Privado
- GET /transactions/<id> - ✅ Privado
- PUT /transactions/<id> - ✅ Privado
- DELETE /transactions/<id> - ✅ Privado
- GET /tasks - ✅ Privado
- POST /tasks - ✅ Privado
- GET /tasks/<id> - ✅ Privado
- PUT /tasks/<id> - ✅ Privado
- DELETE /tasks/<id> - ✅ Privado
- GET /summary - ✅ Privado

---

### 4. COMO USAR A AUTENTICAÇÃO

#### Login (no frontend/mobile)
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'senha123'
  })
});

const data = await response.json();
const token = data.token; // Salvar localStorage
```

#### Requisições autenticadas
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Token do login
};

const response = await fetch('http://localhost:5000/api/patients', {
  method: 'GET',
  headers: headers
});
```

#### Registro de novo usuário
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'senha123'
  })
});
```

---

### 5. MIDDLEWARE DE AUTENTICAÇÃO

Arquivo: [backend/app/auth.py](backend/app/auth.py)

**Decoradores:**
- `@token_required` - Requer autenticação básica
- `@admin_required` - Requer ser administrador

**Validações:**
- ✅ Token presente no header `Authorization: Bearer <token>`
- ✅ Token válido no banco de dados
- ✅ Token não expirado
- ✅ Usuário ativo (not soft-deleted)

**Fluxo:**
1. Cliente envia `Authorization: Bearer token` no header
2. Middleware busca token no banco
3. Valida expiração
4. Adiciona `request.current_user` para acesso na rota
5. Se falhar, retorna 401 ou 403

---

### 6. SEGURANÇA IMPLEMENTADA

| Feature | Status | Descrição |
|---------|--------|-----------|
| Criptografia de senha | ✅ | PBKDF2-SHA256 (padrão Flask) |
| Tokens JWT | ✅ | Tokens únicos com expiração |
| CORS | ✅ | Habilitado para frontend (localhost) |
| SQL Injection | ✅ | ORM SQLAlchemy com prepared statements |
| HTTPS | ⚠️ | Atual em dev (HTTP), usar HTTPS em produção |
| Rate Limiting | ⏳ | Não implementado (ver TODO) |
| 2FA | ⏳ | Não implementado (ver TODO) |

---

### 7. RESPOSTA DE ERRO

Quando autenticação falha:

```json
{
  "error": "Token ausente. Autenticação necessária"
}
```

Status HTTP:
- `401 Unauthorized` - Token inválido/expirado
- `403 Forbidden` - Sem permissão (não é admin)

---

### 8. PRÓXIMOS PASSOS

- [ ] Implementar token refresh automático no frontend
- [ ] Armazenar token seguramente (sessionStorage vs localStorage)
- [ ] Rate limiting para login (máx 5 tentativas)
- [ ] 2FA com email/SMS
- [ ] Audit log de login
- [ ] Sessões multiplas (logout de outras abas)
- [ ] HTTPS configuração para produção
- [ ] CSRF tokens

---

### 9. TESTE DE SEGURANÇA

Para testar se as rotas estão protegidas:

```bash
# SEM token - deve retornar 401
curl http://localhost:5000/api/patients

# COM token - deve funcionar
curl -H "Authorization: Bearer seu_token_aqui" http://localhost:5000/api/patients
```

---

### 10. CRIAR USUÁRIO INICIAL (SQL)

Para inserir um usuário admin manualmente (temporário):

```sql
INSERT INTO users (email, name, password_hash, role, is_active)
VALUES (
  'admin@odonto.com',
  'Administrador',
  'pbkdf2:sha256:$2b$12$...',  -- Hash da senha
  'admin',
  true
);
```

Melhor: use a rota `/api/auth/register` no frontend.
