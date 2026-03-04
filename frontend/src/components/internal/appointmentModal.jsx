import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createAppointment, updateAppointment } from "@/services/mockAppointments";

const SERVICES = [
  { value: "consulta", label: "Consulta" },
  { value: "clareamento", label: "Clareamento" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "implante", label: "Implante" },
  { value: "lentes", label: "Lentes de Contato" },
  { value: "prevencao", label: "Limpeza / Prevenção" },
  { value: "canal", label: "Canal" },
  { value: "outro", label: "Outro" },
];

const STATUSES = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "faltou", label: "Faltou" },
];

export default function AppointmentModal({ appointment, onClose, onSave }) {
  const isEdit = Boolean(appointment?.id);

  const initial = useMemo(
    () => ({
      patient_name: appointment?.patient_name || "",
      patient_phone: appointment?.patient_phone || "",
      patient_email: appointment?.patient_email || "",
      service: appointment?.service || "consulta",
      date: appointment?.date || "",
      time: appointment?.time || "",
      status: appointment?.status || "agendado",
      dentist: appointment?.dentist || "",
      value: appointment?.value ?? "",
      notes: appointment?.notes || "",
    }),
    [appointment]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.patient_name.trim()) return alert("Informe o nome do paciente.");
    if (!form.patient_phone.trim()) return alert("Informe o telefone.");
    if (!form.date) return alert("Informe a data.");
    if (!form.time) return alert("Informe o horário.");

    setSaving(true);

    if (isEdit) {
      await updateAppointment(appointment.id, {
        ...form,
        value: form.value === "" ? 0 : Number(form.value),
      });
    } else {
      await createAppointment({
        ...form,
        value: form.value === "" ? 0 : Number(form.value),
      });
    }

    setSaving(false);
    onSave?.();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 flex items-center justify-between p-6 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEdit ? "Editar Agendamento" : "Novo Agendamento"}
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados e salve para atualizar a lista.
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                <Input
                  value={form.patient_name}
                  onChange={(e) => set("patient_name", e.target.value)}
                  placeholder="Nome completo"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <Input
                  value={form.patient_phone}
                  onChange={(e) => set("patient_phone", e.target.value)}
                  placeholder="(DD) 99999-9999"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <Input
                  value={form.patient_email}
                  onChange={(e) => set("patient_email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dentista</label>
                <Input
                  value={form.dentist}
                  onChange={(e) => set("dentist", e.target.value)}
                  placeholder="Nome do(a) dentista"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço *</label>
                <select
                  value={form.service}
                  onChange={(e) => set("service", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white w-full"
                >
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white w-full"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <Input
                  value={form.value}
                  onChange={(e) => set("value", e.target.value)}
                  placeholder="0,00"
                  className="rounded-xl"
                />
              </div>
              <div />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}