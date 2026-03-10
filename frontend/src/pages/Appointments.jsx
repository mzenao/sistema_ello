import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Calendar, Phone, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AppointmentModal from "@/components/internal/AppointmentModal.jsx";

import {
  listAppointments,
  deleteAppointment,
  updateAppointment,
} from "@/services/api";

const statusColors = {
  agendado: "bg-blue-100 text-blue-700",
  confirmado: "bg-green-100 text-green-700",
  realizado: "bg-gray-100 text-gray-700",
  cancelado: "bg-red-100 text-red-700",
  faltou: "bg-orange-100 text-orange-700",
};

const serviceLabels = {
  clareamento: "Clareamento",
  implante: "Implante",
  ortodontia: "Ortodontia",
  canal: "Canal",
  lentes: "Lentes",
  prevencao: "Prevenção",
  consulta: "Consulta",
  outro: "Outro",
};

// Função para manter consistência no filtro - usar data local, não UTC
const formatDateISO = (date) => {
  // Converte para Date se for string
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDatePtBr = (date) => {
  // Converte para Date se for string
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function Agendamentos() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState(""); 

  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await listAppointments(200);

    // garantir que cada appointment tenha dateStr em ISO
    const normalized = data.map((a) => ({
      ...a,
      dateStr: a.date, // Já vem em ISO do backend "2026-03-10"
      dateDisplay: formatDatePtBr(a.date), // para mostrar na tela
    }));

    setAppointments(normalized);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return appointments.filter((a) => {
      const name = (a.patient_name || "").toLowerCase();
      const phone = a.patient_phone || "";

      const matchSearch =
        !s || name.includes(s) || phone.includes(search.trim());
      const matchStatus =
        statusFilter === "todos" || a.status === statusFilter;
      const matchDate = !dateFilter || a.dateStr === dateFilter; // usa ISO

      return matchSearch && matchStatus && matchDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);


  const handleDelete = async (id) => {
    if (!confirm("Remover este agendamento?")) return;
    await deleteAppointment(id);
    load();
  };

  const handleStatusChange = async (appt, newStatus) => {
    await updateAppointment(appt.id, { status: newStatus });
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar paciente ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-gray-200"
            />
          </div>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border-gray-200 w-auto"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="faltou">Faltou</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setEditingAppt(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{appt.patient_name?.[0] || "?"}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{appt.patient_name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-sm text-gray-500">
                        {appt.dateDisplay} · {appt.time}
                      </span>
                      <span className="text-sm text-gray-400">·</span>
                      <span className="text-sm text-gray-600">
                        {serviceLabels[appt.service] || "Consulta"}
                      </span>
                      {appt.dentist && (
                        <span className="text-xs text-gray-400">· Dr(a). {appt.dentist}</span>
                      )}
                    </div>

                    {appt.patient_phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{appt.patient_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt, e.target.value)}
                      className={`text-xs border-0 rounded-lg px-2 py-1.5 font-medium cursor-pointer ${
                        statusColors[appt.status] || ""
                      }`}
                    >
                      <option value="agendado">Agendado</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="realizado">Realizado</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="faltou">Faltou</option>
                    </select>

                    {appt.value ? (
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        R$ {Number(appt.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingAppt(appt);
                        setShowModal(true);
                      }}
                      className="w-8 h-8 text-gray-400 hover:text-teal-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(appt.id)}
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

      {showModal && (
        <AppointmentModal
          appointment={editingAppt}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}