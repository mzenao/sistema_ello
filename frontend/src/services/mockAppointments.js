const KEY = "odonto_mock_appointments_v1";

function seed() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);

  return [
    {
      id: crypto.randomUUID(),
      patient_name: "Maria Clara",
      patient_phone: "(32) 99999-1111",
      patient_email: "maria@gmail.com",
      service: "clareamento",
      date: `${yyyy}-${mm}-${pad(now.getDate())}`,
      time: "09:00",
      status: "confirmado",
      dentist: "Lucas",
      value: 200,
      notes: "Primeira sessão",
      created_at: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      patient_name: "João Pedro",
      patient_phone: "(32) 99999-2222",
      patient_email: "",
      service: "consulta",
      date: `${yyyy}-${mm}-${pad(now.getDate())}`,
      time: "10:30",
      status: "agendado",
      dentist: "",
      value: 0,
      notes: "",
      created_at: Date.now() - 100000,
    },
    {
      id: crypto.randomUUID(),
      patient_name: "Ana Beatriz",
      patient_phone: "(32) 99999-3333",
      patient_email: "ana@gmail.com",
      service: "canal",
      date: `${yyyy}-${mm}-${pad(now.getDate() + 1)}`,
      time: "14:00",
      status: "agendado",
      dentist: "Carla",
      value: 350,
      notes: "",
      created_at: Date.now() - 200000,
    },
  ];
}

function readAll() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function sortByDateTimeDesc(a, b) {
  const da = `${a.date || ""} ${a.time || ""}`;
  const db = `${b.date || ""} ${b.time || ""}`;
  return db.localeCompare(da);
}

export async function listAppointments(limit = 200) {
  await new Promise((r) => setTimeout(r, 200));
  const data = readAll().sort(sortByDateTimeDesc);
  return data.slice(0, limit);
}

export async function createAppointment(payload) {
  await new Promise((r) => setTimeout(r, 200));
  const data = readAll();
  const item = {
    id: crypto.randomUUID(),
    patient_name: payload.patient_name || "",
    patient_phone: payload.patient_phone || "",
    patient_email: payload.patient_email || "",
    service: payload.service || "consulta",
    date: payload.date || "",
    time: payload.time || "",
    status: payload.status || "agendado",
    dentist: payload.dentist || "",
    value: Number(payload.value || 0),
    notes: payload.notes || "",
    created_at: Date.now(),
  };
  const next = [item, ...data];
  writeAll(next);
  return item;
}

export async function updateAppointment(id, patch) {
  await new Promise((r) => setTimeout(r, 200));
  const data = readAll();
  const next = data.map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeAll(next);
  return next.find((a) => a.id === id) || null;
}

export async function deleteAppointment(id) {
  await new Promise((r) => setTimeout(r, 200));
  const data = readAll();
  const next = data.filter((a) => a.id !== id);
  writeAll(next);
  return true;
}