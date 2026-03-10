import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PatientModal({ patient, onClose, onSave }) {
  const [form, setForm] = useState({
    id: undefined,
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    cpf: "",
    address: "",
    health_plan: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        id: patient.id,
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        birth_date: patient.birth_date || "",
        cpf: patient.cpf || "",
        address: patient.address || "",
        health_plan: patient.health_plan || "",
        notes: patient.notes || "",
      });
    }
  }, [patient]);

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Informe o nome do paciente.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Informe o telefone.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert("Erro ao salvar paciente: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {patient ? "Editar Paciente" : "Novo Paciente"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento
              </label>
              <Input
                type="date"
                value={form.birth_date}
                onChange={(e) => set("birth_date", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <Input
                value={form.cpf}
                onChange={(e) => set("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Convênio
              </label>
              <Input
                value={form.health_plan}
                onChange={(e) => set("health_plan", e.target.value)}
                placeholder="Nome do convênio"
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Médicas
              </label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}