# 🚀 PRÓXIMOS PASSOS - Conectar Frontend com Backend

## Instruções para colocar o sistema para funcionar:

### PASSO 1: Configurar e Iniciar o Backend ⚙️

1. **Abrir terminal no diretório `backend`**
   ```powershell
   cd backend
   ```

2. **Criar e ativar ambiente virtual**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Instalar dependências**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configurar PostgreSQL**
   
   Você tem 2 opções:
   
   **Opção A - Instalar PostgreSQL:**
   - Baixe: https://www.postgresql.org/download/windows/
   - Instale com senha padrão: `postgres`
   - Crie o banco:
     ```sql
     psql -U postgres
     CREATE DATABASE sistema_odontologico;
     \q
     ```
   
   **Opção B - Docker (mais rápido):**
   ```powershell
   docker run --name postgres-odonto -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sistema_odontologico -p 5432:5432 -d postgres:15
   ```

5. **Criar arquivo .env**
   ```powershell
   copy .env.example .env
   ```
   
   Edite o arquivo `.env` se necessário (senha do banco).

6. **Inicializar banco de dados com dados de exemplo**
   ```powershell
   python scripts/init_db.py
   ```

7. **Iniciar o servidor backend**
   ```powershell
   python run.py
   ```
   
   ✅ Backend rodando em: http://localhost:5000

---

### PASSO 2: Atualizar Frontend para usar API Real 🎨

1. **Abrir novo terminal no diretório `frontend`**
   ```powershell
   cd frontend
   ```

2. **Atualizar o arquivo `src/services/api.js`**
   
   Mude `MOCK = true` para `MOCK = false` e adicione as URLs da API.
   
   (Vou criar este arquivo atualizado para você)

3. **Iniciar o servidor frontend**
   ```powershell
   npm run dev
   ```
   
   ✅ Frontend rodando em: http://localhost:5173

---

### PASSO 3: Testar a Integração ✅

Com ambos servidores rodando:

1. Acesse http://localhost:5173
2. Navegue para página de **Pacientes**
3. Tente criar, editar e deletar pacientes
4. Teste os **Agendamentos**
5. Teste as **Transações Financeiras**
6. Verifique o **Calendário**

---

## 📋 Checklist de Verificação

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `sistema_odontologico` criado
- [ ] Backend instalado (pip install)
- [ ] Arquivo `.env` configurado
- [ ] Banco inicializado (python scripts/init_db.py)
- [ ] Backend rodando na porta 5000
- [ ] Frontend rodando na porta 5173
- [ ] Frontend conectando com backend (api.js atualizado)
- [ ] CORS funcionando corretamente
- [ ] Dados carregando nas páginas

---

## 🐛 Problemas Comuns

### Backend não inicia
```
Erro: psycopg2.OperationalError
```
**Solução:** Verificar se PostgreSQL está rodando e se as credenciais no `.env` estão corretas.

### Frontend não conecta ao backend
```
Erro: Network Error ou CORS
```
**Solução:** 
1. Verificar se backend está rodando em http://localhost:5000
2. Verificar se CORS está configurado (já está no código)
3. Verificar console do navegador para erros

### Dados não aparecem
**Solução:**
1. Abrir http://localhost:5000/api/health - deve retornar `{"status": "ok"}`
2. Abrir http://localhost:5000/api/patients - deve retornar lista de pacientes
3. Verificar console do navegador para erros

---

## 📞 Endpoints para Testar

Você pode testar os endpoints diretamente no navegador ou com Postman:

- http://localhost:5000/api/health
- http://localhost:5000/api/patients
- http://localhost:5000/api/appointments
- http://localhost:5000/api/financial/transactions
- http://localhost:5000/api/financial/tasks

---

## 🎯 Resultado Final

Quando tudo estiver funcionando:

✅ Backend Flask rodando em http://localhost:5000
✅ Frontend React rodando em http://localhost:5173
✅ Dados sendo salvos no PostgreSQL
✅ CRUD completo de Pacientes, Agendamentos, Transações e Tarefas
✅ Calendário funcionando com dados reais
✅ Dashboard com métricas reais

---

**IMPORTANTE:** Mantenha ambos terminais abertos (backend + frontend) para o sistema funcionar completamente!
