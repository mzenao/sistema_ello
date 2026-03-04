import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeModal from "@/components/internal/EmployeeModal.jsx";

// Chave para armazenar funcionários no localStorage
const STORAGE_KEY = "odontoello_employees_v1";

// Parse seguro de JSON com fallback
function safeParse(json, fallback) {
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : fallback;
  } catch {
    return fallback;
  }
}

// Carrega lista de funcionários do localStorage
function loadEmployees() {
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

// Salva lista de funcionários no localStorage
function saveEmployees(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Gera ID único para novo funcionário
function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Funcionarios() {
  // Estado da lista de funcionários
  const [employees, setEmployees] = useState([]);
  
  // Flag de carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Texto de busca/filtro
  const [search, setSearch] = useState("");
  
  // Controla visibilidade do modal de criar/editar
  const [showModal, setShowModal] = useState(false);
  
  // Funcionário sendo editado (null = criar novo)
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Função para carregar funcionários do localStorage
  const load = () => {
    setLoading(true);
    const data = loadEmployees()
      // Ordena por data de criação (mais novos primeiro)
      .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
    setEmployees(data);
    setLoading(false);
  };

  // Carrega funcionários ao montar + seed de dados
  useEffect(() => {
    // Verifica se há funcionários salvos
    const current = loadEmployees();
    if (current.length === 0) {
      // Se vazio, cria funcionários de exemplo
      const seeded = [
        {
          id: uid(),
          name: "Dr. Carlos Mendes",
          phone: "(32) 99999-1001",
          email: "carlos@clinica.com",
          role: "Dentista",
          specialty: "Implantodontia",
          cpf: "123.456.789-00",
          created_date: new Date().toISOString(),
        },
        {
          id: uid(),
          name: "Ana Silva",
          phone: "(32) 99999-1002",
          email: "ana@clinica.com",
          role: "Auxiliar de Consultório",
          specialty: "Geral",
          cpf: "987.654.321-00",
          created_date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: uid(),
          name: "Fernanda Costa",
          phone: "(32) 99999-1003",
          email: "fernanda@clinica.com",
          role: "Recepcionista",
          specialty: "Agendamento",
          cpf: "456.789.123-00",
          created_date: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      saveEmployees(seeded);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtra funcionários por nome, telefone, email ou função
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      const name = (e.name || "").toLowerCase();
      const phone = (e.phone || "");
      const email = (e.email || "").toLowerCase();
      const role = (e.role || "").toLowerCase();
      return (
        name.includes(q) || 
        phone.includes(q) || 
        email.includes(q) || 
        role.includes(q)
      );
    });
  }, [employees, search]);

  // Deleta funcionário com confirmação
  const handleDelete = async (id) => {
    if (!confirm("Remover este funcionário?")) return;

    const next = employees.filter((e) => e.id !== id);
    setEmployees(next);
    saveEmployees(next);
  };

  // Salva novo funcionário ou edita existente
  // - Se tiver ID: atualiza dados do funcionário
  // - Se não tiver ID: cria novo funcionário com ID único e data
  const handleSave = (employeeData) => {
    const now = new Date().toISOString();

    // Edição - atualiza funcionário existente
    if (employeeData?.id) {
      const next = employees.map((e) =>
        e.id === employeeData.id ? { ...e, ...employeeData } : e
      );
      setEmployees(next);
      saveEmployees(next);
      return;
    }

    // Novo - cria funcionário novo
    const newEmployee = {
      id: uid(),
      created_date: now,
      ...employeeData,
    };
    const next = [newEmployee, ...employees];
    setEmployees(next);
    saveEmployees(next);
  };

  return (
    <div className="space-y-6">
      {/* Barra de filtro e botão novo */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar funcionário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-gray-200"
          />
        </div>

        {/* Botão para abrir modal de novo funcionário */}
        <Button
          onClick={() => {
            setEditingEmployee(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Funcionário
        </Button>
      </div>

      {/* Card com lista/tabela de funcionários */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Estado de carregamento */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            // Estado vazio - sem resultados
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhum funcionário encontrado</p>
            </div>
          ) : (
            // Lista de funcionários
            <div className="divide-y divide-gray-50">
              {filtered.map((employee) => (
                <div key={employee.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  {/* Avatar com inicial do nome */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{employee.name?.[0]}</span>
                  </div>

                  {/* Info principal - Nome e contatos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{employee.name}</p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {employee.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {employee.phone}
                        </span>
                      )}
                      {employee.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {employee.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge com cargo do funcionário */}
                  {employee.role && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-lg hidden sm:inline-flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {employee.role}
                    </span>
                  )}

                  {/* Botões de editar e deletar */}
                  <div className="flex gap-1">
                    {/* Botão editar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setShowModal(true);
                      }}
                      className="w-8 h-8 text-gray-400 hover:text-teal-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {/* Botão deletar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(employee.id)}
                      className="w-8 h-8 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para criar/editar funcionário */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            handleSave(data);
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}