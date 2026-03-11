// Configuração da API
const API_HOST = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_BASE_URL = `${API_HOST}/api`;

// Helper para fazer requisições com token automático
async function apiRequest(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Adicionar token em qualquer rota quando existir sessão ativa
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Se 401, token expirou ou não é válido
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Não forçar redirect em tentativa de login inválida
      if (endpoint !== '/auth/login') {
        window.location.href = '/';
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// ============ AUTENTICAÇÃO / AUTH ============

export async function register(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(email, password) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Salvar token e usuário
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  }
  
  return response;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    // Sempre limpar localStorage mesmo se logout falhar
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export async function getCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export async function refreshToken() {
  const response = await apiRequest("/auth/refresh-token", {
    method: "POST",
  });
  
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }
  
  return response;
}

export function isAuthenticated() {
  return !!localStorage.getItem('auth_token');
}

export function getStoredUser() {
  const user = localStorage.getItem('auth_user');
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.warn('auth_user inválido no localStorage, limpando sessão.', error);
    localStorage.removeItem('auth_user');
    return null;
  }
}

// ============ AGENDAMENTOS / APPOINTMENTS ============

export async function listAppointments(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/appointments?${params}`);
}

export async function getAppointment(id) {
  return apiRequest(`/appointments/${id}`);
}

export async function createAppointment(data) {
  return apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAppointment(id, data) {
  return apiRequest(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAppointment(id) {
  return apiRequest(`/appointments/${id}`, {
    method: "DELETE",
  });
}

// ============ PACIENTES / PATIENTS ============

export async function listPatients() {
  return apiRequest("/patients");
}

export async function getPatient(id) {
  return apiRequest(`/patients/${id}`);
}

export async function createPatient(data) {
  return apiRequest("/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePatient(id, data) {
  return apiRequest(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePatient(id) {
  return apiRequest(`/patients/${id}`, {
    method: "DELETE",
  });
}

export async function searchPatients(query) {
  return apiRequest(`/patients/search?q=${encodeURIComponent(query)}`);
}

// ============ TRANSAÇÕES / TRANSACTIONS ============

export async function listTransactions(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/financial/transactions?${params}`);
}

export async function getTransaction(id) {
  return apiRequest(`/financial/transactions/${id}`);
}

export async function createTransaction(data) {
  return apiRequest("/financial/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(id, data) {
  return apiRequest(`/financial/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id) {
  return apiRequest(`/financial/transactions/${id}`, {
    method: "DELETE",
  });
}

export async function getFinancialSummary(month, year) {
  return apiRequest(`/financial/summary?month=${month}&year=${year}`);
}

// ============ TAREFAS / TASKS ============

export async function listTasks(filters = {}) {
  const params = new URLSearchParams(filters);
  return apiRequest(`/financial/tasks?${params}`);
}

export async function getTask(id) {
  return apiRequest(`/financial/tasks/${id}`);
}

export async function createTask(data) {
  return apiRequest("/financial/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(id, data) {
  return apiRequest(`/financial/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id) {
  return apiRequest(`/financial/tasks/${id}`, {
    method: "DELETE",
  });
}

// ============ CALENDÁRIO / CALENDAR ============

export async function getCalendarEvents(month, year) {
  // Combina eventos de agendamentos e financeiro
  const appointments = await apiRequest(`/appointments/calendar?month=${month}&year=${year}`);
  const financial = await apiRequest(`/financial/calendar-events?month=${month}&year=${year}`);
  
  return [...appointments, ...financial];
}

// ============ FUNCIONÁRIOS / WORKERS ============

export async function listWorkers() {
  return apiRequest("/workers");
}

export async function getWorker(id) {
  return apiRequest(`/workers/${id}`);
}

export async function createWorker(data) {
  return apiRequest("/workers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWorker(id, data) {
  return apiRequest(`/workers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWorker(id) {
  return apiRequest(`/workers/${id}`, {
    method: "DELETE",
  });
}

// ============ HEALTH CHECK ============

export async function checkHealth() {
  return apiRequest('/health');
}
