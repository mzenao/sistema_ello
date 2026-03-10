import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "cancelada", label: "Cancelada" },
];

const PRIORITIES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

export default function TaskModal({ task, onClose, onSave }) {
  const isEdit = Boolean(task?.id);

  const initial = useMemo(
    () => ({
      title: task?.title || "",
      date: task?.date || "",
      status: task?.status || "aberta",
      priority: task?.priority || "media",
      notes: task?.notes || "",
    }),
    [task]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Informe o título da tarefa.");
    if (!form.date) return alert("Informe a data.");

    setSaving(true);

    // Simula um pequeno delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Chama o callback onSave passando os dados
    onSave?.({
      ...(isEdit && { id: task.id }),
      ...form,
      type: "task",
    });

    setSaving(false);
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
                {isEdit ? "Editar Tarefa" : "Nova Tarefa"}
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados e salve para atualizar a lista.
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="grid sm:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Tarefa *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ex: Conferir estoque de materiais"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white w-full"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Detalhes adicionais sobre a tarefa..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white"
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
