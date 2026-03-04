const MOCK = true; // <-- depois você troca pra false quando tiver backend

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function listAppointments() {
  if (!MOCK) throw new Error("Backend não configurado.");

  await sleep(400);
  return [
    {
      id: 1,
      patient_name: "Maria Clara",
      service: "clareamento",
      date: "2026-03-03",
      time: "10:00",
      status: "confirmado",
    },
    {
      id: 2,
      patient_name: "João Pedro",
      service: "canal",
      date: "2026-03-03",
      time: "14:30",
      status: "agendado",
    },
    {
      id: 3,
      patient_name: "Ana Beatriz",
      service: "consulta",
      date: "2026-03-04",
      time: "09:00",
      status: "agendado",
    },
  ];
}

export async function listTransactions() {
  if (!MOCK) throw new Error("Backend não configurado.");

  await sleep(400);
  return [
    { id: 1, type: "receita", description: "Consulta - Maria Clara", date: "2026-03-02", amount: 150 },
    { id: 2, type: "despesa", description: "Material odontológico", date: "2026-03-02", amount: 320 },
    { id: 3, type: "receita", description: "Clareamento - João Pedro", date: "2026-03-01", amount: 900 },
    { id: 4, type: "despesa", description: "Internet/Software", date: "2026-03-01", amount: 99.9 },
  ];
}

export async function createAppointment(data) {
  if (!MOCK) throw new Error("Backend não configurado.");

  await sleep(300);
  return { id: Date.now(), ...data };
}