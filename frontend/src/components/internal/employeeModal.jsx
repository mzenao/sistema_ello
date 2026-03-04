import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ROLES = [
  "Dentista",
  "Auxiliar de Consultório",
  "Recepcionista",
  "Gerente",
  "Limpeza",
];

const SPECIALTIES = [
  "Geral",
  "Implantodontia",
  "Ortodontia",
  "Endodontia",
  "Periodontia",
  "Estética",
];

export default function EmployeeModal({ employee, onClose, onSave }) {
  const initial = useMemo(() => {
    const base = {
      name: "",
      phone: "",
      email: "",
      cpf: "",
      role: "Auxiliar de Consultório",
      specialty: "Geral",
      hire_date: "",
      salary: "",
      notes: "",
    };
    if (!employee) return base;
    return { ...base, ...employee };
  }, [employee]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, id: employee?.id });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 flex items-center justify-between p-6 z-10">
            <h2 className="text-xl font-bold">
              {employee ? "Editar Funcionário" : "Novo Funcionário"}
            </h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* coluna 1 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefone
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <Input
                  value={form.cpf}
                  onChange={(e) => set("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cargo *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Especialidade
                </label>
                <select
                  value={form.specialty}
                  onChange={(e) => set("specialty", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de Admissão
                </label>
                <Input
                  type="date"
                  value={form.hire_date}
                  onChange={(e) => set("hire_date", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Salário (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.salary}
                  onChange={(e) => set("salary", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Observações
                </label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}