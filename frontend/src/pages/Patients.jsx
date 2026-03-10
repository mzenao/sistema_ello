import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PatientModal from "@/components/internal/PatientModal.jsx";
import { listPatients, createPatient, updatePatient, deletePatient } from "@/services/api";

export default function Pacientes() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listPatients();
      setPatients(data);
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const phone = (p.phone || "");
      const email = (p.email || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [patients, search]);

  const handleDelete = async (id) => {
    if (!confirm("Remover este paciente?")) return;
    try {
      await deletePatient(id);
      load();
    } catch (err) {
      alert("Erro ao remover paciente: " + err.message);
    }
  };

  const handleSave = async (patientData) => {
    if (patientData?.id) {
      await updatePatient(patientData.id, patientData);
    } else {
      await createPatient(patientData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-gray-200"
          />
        </div>

        <Button
          onClick={() => {
            setEditingPatient(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhum paciente encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((patient) => (
                <div key={patient.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{patient.name?.[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {patient.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {patient.health_plan && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-lg hidden sm:block">
                      {patient.health_plan}
                    </span>
                  )}

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPatient(patient);
                        setShowModal(true);
                      }}
                      className="w-8 h-8 text-gray-400 hover:text-teal-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(patient.id)}
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
        <PatientModal
          patient={editingPatient}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await handleSave(data);
            load();
          }}
        />
      )}
    </div>
  );
}