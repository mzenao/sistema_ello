import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Stethoscope,
  Receipt,
  CheckSquare,
  Plus,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskModal from "@/components/internal/taskModal";
import AppointmentModal from "@/components/internal/appointmentModal";
import TransactionModal from "@/components/internal/transactionModal";
import { listAppointments, listTransactions, listTasks, createTask, updateTask, createTransaction, updateTransaction } from "@/services/api";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getTodayISO() {
  // Pega a data local sem problemas de fuso horário
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toISODate(y, m, d) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isSameISO(a, b) {
  return a === b;
}
function isPastISO(iso) {
  const today = startOfDay(new Date());
  const d = startOfDay(new Date(iso + "T00:00:00"));
  return d < today;
}
function isTodayISO(iso) {
  const today = new Date();
  return iso === toISODate(today.getFullYear(), today.getMonth(), today.getDate());
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0..6 (Dom..Sáb)
}

const TYPE_META = {
  appointment: {
    label: "Agendamento",
    icon: Stethoscope,
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  bill: {
    label: "Contas",
    icon: Receipt,
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
  },
  task: {
    label: "Tarefas",
    icon: CheckSquare,
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-800",
  },
};


function formatMoneyBR(v) {
  if (typeof v !== "number") return "";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function sortEventsForDay(list) {
  // Agenda com horário primeiro; resto depois
  return [...list].sort((a, b) => {
    const ta = a.time ? a.time.replace(":", "") : "9999";
    const tb = b.time ? b.time.replace(":", "") : "9999";
    if (ta !== tb) return Number(ta) - Number(tb);
    return (a.title || "").localeCompare(b.title || "");
  });
}

function formatBRDate(iso) {
  // Converte "2026-03-04" para "4 de março de 2026"
  const [year, month, day] = iso.split("-");
  const monthIndex = parseInt(month) - 1;
  const dayNum = parseInt(day);
  const monthName = MONTHS[monthIndex];
  return `${dayNum} de ${monthName} de ${year}`;
}

export default function CalendarHub({
  title = "Calendário",
  events: externalEvents = [],
}) {
  const [events, setEvents] = useState(externalEvents);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [selectedISO, setSelectedISO] = useState(getTodayISO());

  const [filter, setFilter] = useState("all"); // all | appointment | bill | task
  const [showAll, setShowAll] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Buscar eventos da API se não foram passados externamente
  useEffect(() => {
    if (externalEvents.length > 0) {
      setEvents(externalEvents);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadEvents() {
      try {
        setLoading(true);
        
        const [appts, txns, tasks] = await Promise.all([
          listAppointments({ limit: 500, signal: controller.signal }).catch(() => []),
          listTransactions({ limit: 500, signal: controller.signal }).catch(() => []),
          listTasks({ signal: controller.signal }).catch(() => []),
        ]);

        // Transformar dados para formato do calendário
        const transformedEvents = [];

        // Adicionar agendamentos
        const appointmentsList = Array.isArray(appts) ? appts : appts?.data ?? [];
        transformedEvents.push(...appointmentsList.map((a) => ({
          id: `appt-${a.id}`,
          type: "appointment",
          date: a.date,
          time: a.time ? a.time.substring(0, 5) : undefined,
          title: `${a.service} · ${a.patient_name}`,
          status: a.status,
          meta: { service: a.service, phone: a.patient_phone },
        })));

        // Adicionar transações como "contas" (bills)
        const transactionsList = Array.isArray(txns) ? txns : txns?.data ?? [];
        transformedEvents.push(...transactionsList.map((t) => ({
          id: `txn-${t.id}`,
          type: "bill",
          date: t.date,
          title: t.description || "Transação",
          status: t.status,
          amount: Number(t.amount) || 0,
        })));

        // Adicionar tarefas
        const tasksList = Array.isArray(tasks) ? tasks : tasks?.data ?? [];
        transformedEvents.push(...tasksList.map((t) => ({
          id: `task-${t.id}`,
          type: "task",
          date: t.date,
          title: t.title,
          status: t.status,
        })));

        setEvents(transformedEvents);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Erro ao carregar eventos do calendário:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
    return () => controller.abort();
  }, [externalEvents]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const visibleMonthKey = `${calYear}-${pad2(calMonth + 1)}`;

  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      if (!e?.date) continue;
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    // ordenar cada dia
    for (const [k, v] of map.entries()) {
      map.set(k, sortEventsForDay(v));
    }
    return map;
  }, [events]);

  const selectedEventsRaw = eventsByDate.get(selectedISO) || [];
  const selectedEvents = useMemo(() => {
    if (filter === "all") return selectedEventsRaw;
    return selectedEventsRaw.filter((e) => e.type === filter);
  }, [selectedEventsRaw, filter]);

  const displayedEvents = showAll ? selectedEvents : selectedEvents.slice(0, 3);
  const hasMoreItems = selectedEvents.length > 3;

  const dayCounts = useMemo(() => {
    const all = selectedEventsRaw;
    const c = { appointment: 0, bill: 0, task: 0 };
    for (const e of all) c[e.type] = (c[e.type] || 0) + 1;
    return c;
  }, [selectedEventsRaw]);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
  };

  const jumpToToday = () => {
    const t = new Date();
    setCalYear(t.getFullYear());
    setCalMonth(t.getMonth());
    setSelectedISO(toISODate(t.getFullYear(), t.getMonth(), t.getDate()));
  };

  const openDay = (iso) => {
    setSelectedISO(iso);
    setShowAll(false);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        // Editar tarefa existente
        await updateTask(taskData.id, taskData);
      } else {
        // Criar nova tarefa
        await createTask(taskData);
      }
      
      // Recarregar eventos
      setLoading(true);
      const [appts, txns, tasks] = await Promise.all([
        listAppointments({ limit: 500 }).catch(() => []),
        listTransactions({ limit: 500 }).catch(() => []),
        listTasks().catch(() => []),
      ]);

      const transformedEvents = [];

      const appointmentsList = Array.isArray(appts) ? appts : appts?.data ?? [];
      transformedEvents.push(...appointmentsList.map((a) => ({
        id: `appt-${a.id}`,
        type: "appointment",
        date: a.date,
        time: a.time ? a.time.substring(0, 5) : undefined,
        title: `${a.service} · ${a.patient_name}`,
        status: a.status,
        meta: { service: a.service, phone: a.patient_phone },
      })));

      const transactionsList = Array.isArray(txns) ? txns : txns?.data ?? [];
      transformedEvents.push(...transactionsList.map((t) => ({
        id: `txn-${t.id}`,
        type: "bill",
        date: t.date,
        title: t.description || "Transação",
        status: t.status,
        amount: Number(t.amount) || 0,
      })));

      const tasksList = Array.isArray(tasks) ? tasks : tasks?.data ?? [];
      transformedEvents.push(...tasksList.map((t) => ({
        id: `task-${t.id}`,
        type: "task",
        date: t.date,
        title: t.title,
        status: t.status,
      })));

      setEvents(transformedEvents);
      setShowTaskModal(false);
      setEditingTask(null);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      alert("Erro ao salvar tarefa");
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      if (transactionData.id) {
        // Editar transação existente
        await updateTransaction(transactionData.id, transactionData);
      } else {
        // Criar nova transação
        await createTransaction(transactionData);
      }
      
      // Recarregar eventos
      setLoading(true);
      const [appts, txns, tasks] = await Promise.all([
        listAppointments({ limit: 500 }).catch(() => []),
        listTransactions({ limit: 500 }).catch(() => []),
        listTasks().catch(() => []),
      ]);

      const transformedEvents = [];

      const appointmentsList = Array.isArray(appts) ? appts : appts?.data ?? [];
      transformedEvents.push(...appointmentsList.map((a) => ({
        id: `appt-${a.id}`,
        type: "appointment",
        date: a.date,
        time: a.time ? a.time.substring(0, 5) : undefined,
        title: `${a.service} · ${a.patient_name}`,
        status: a.status,
        meta: { service: a.service, phone: a.patient_phone },
      })));

      const transactionsList = Array.isArray(txns) ? txns : txns?.data ?? [];
      transformedEvents.push(...transactionsList.map((t) => ({
        id: `txn-${t.id}`,
        type: "bill",
        date: t.date,
        title: t.description || "Transação",
        status: t.status,
        amount: Number(t.amount) || 0,
      })));

      const tasksList = Array.isArray(tasks) ? tasks : tasks?.data ?? [];
      transformedEvents.push(...tasksList.map((t) => ({
        id: `task-${t.id}`,
        type: "task",
        date: t.date,
        title: t.title,
        status: t.status,
      })));

      setEvents(transformedEvents);
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      alert("Erro ao salvar transação");
    }
  };

  const handleSaveAppointment = async () => {
    try {
      // Recarregar eventos após salvar
      setLoading(true);
      const [appts, txns, tasks] = await Promise.all([
        listAppointments({ limit: 500 }).catch(() => []),
        listTransactions({ limit: 500 }).catch(() => []),
        listTasks().catch(() => []),
      ]);

      const transformedEvents = [];

      const appointmentsList = Array.isArray(appts) ? appts : appts?.data ?? [];
      transformedEvents.push(...appointmentsList.map((a) => ({
        id: `appt-${a.id}`,
        type: "appointment",
        date: a.date,
        time: a.time ? a.time.substring(0, 5) : undefined,
        title: `${a.service} · ${a.patient_name}`,
        status: a.status,
        meta: { service: a.service, phone: a.patient_phone },
      })));

      const transactionsList = Array.isArray(txns) ? txns : txns?.data ?? [];
      transformedEvents.push(...transactionsList.map((t) => ({
        id: `txn-${t.id}`,
        type: "bill",
        date: t.date,
        title: t.description || "Transação",
        status: t.status,
        amount: Number(t.amount) || 0,
      })));

      const tasksList = Array.isArray(tasks) ? tasks : tasks?.data ?? [];
      transformedEvents.push(...tasksList.map((t) => ({
        id: `task-${t.id}`,
        type: "task",
        date: t.date,
        title: t.title,
        status: t.status,
      })));

      setEvents(transformedEvents);
      setShowAppointmentModal(false);
      setEditingAppointment(null);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      alert("Erro ao salvar agendamento");
    }
  };

  const handleEditEvent = (event) => {
    if (event.type === "task") {
      setEditingTask(event);
      setShowTaskModal(true);
    } else if (event.type === "appointment") {
      // Converter o formato do evento para o formato do AppointmentModal
      const appointmentData = {
        id: event.id,
        patient_name: event.title?.split(" · ")[1] || event.title,
        patient_phone: event.meta?.phone || "",
        patient_email: "",
        service: event.meta?.service?.toLowerCase() || "consulta",
        date: event.date,
        time: event.time,
        status: event.status,
        dentist: "",
        value: "",
        notes: "",
      };
      setEditingAppointment(appointmentData);
      setShowAppointmentModal(true);
    } else if (event.type === "bill") {
      // Converter o formato do evento para o formato do TransactionModal
      const transactionData = {
        id: event.id,
        type: "despesa",
        category: "outro",
        description: event.title,
        amount: event.amount || 0,
        date: event.date,
        payment_method: "pix",
        status: event.status === "pendente" ? "pendente" : "pago",
        patient_name: "",
        notes: "",
      };
      setEditingTransaction(transactionData);
      setShowTransactionModal(true);
    }
  };

  const monthLabel = `${MONTHS[calMonth]} ${calYear}`;

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">
                {MONTHS[calMonth]} {calYear} · clique em um dia para ver detalhes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={jumpToToday}
              className="px-3 py-2 rounded-xl text-sm bg-gray-50 hover:bg-gray-100 text-gray-700"
              type="button"
            >
              Hoje
            </button>
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center"
              type="button"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-[160px] text-center font-semibold text-gray-800">
              {monthLabel}
            </div>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center"
              type="button"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week header */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="bg-white py-3 text-center text-xs font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {/* empty slots - days from previous month */}
          {Array.from({ length: firstDay }).map((_, i) => {
            const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
            const prevYear = calMonth === 0 ? calYear - 1 : calYear;
            const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
            const day = daysInPrevMonth - firstDay + i + 1;
            return (
              <div
                key={`empty-prev-${i}`}
                className="bg-white h-24 p-3 flex items-center justify-center text-gray-300 opacity-40"
              >
                <span className="text-sm font-semibold">{day}</span>
              </div>
            );
          })}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const iso = toISODate(calYear, calMonth, day);
            const isSelected = isSameISO(iso, selectedISO);
            const list = eventsByDate.get(iso) || [];

            const hasAppointment = list.some((e) => e.type === "appointment");
            const hasBill = list.some((e) => e.type === "bill");
            const hasTask = list.some((e) => e.type === "task");

            return (
              <button
                key={iso}
                type="button"
                onClick={() => openDay(iso)}
                className={`bg-white h-24 p-3 text-left hover:bg-gray-50 transition-colors relative outline-none ${
                  isSelected ? "ring-2 ring-teal-500 ring-inset" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isTodayISO(iso)
                          ? "text-teal-700"
                          : isPastISO(iso)
                          ? "text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {day}
                    </span>
                    {isTodayISO(iso) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium">
                        hoje
                      </span>
                    )}
                  </div>

                  {list.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {list.length}
                    </span>
                  )}
                </div>

                {/* dots */}
                <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
                  {hasAppointment && <span className={`w-2 h-2 rounded-full ${TYPE_META.appointment.dot}`} />}
                  {hasBill && <span className={`w-2 h-2 rounded-full ${TYPE_META.bill.dot}`} />}
                  {hasTask && <span className={`w-2 h-2 rounded-full ${TYPE_META.task.dot}`} />}
                </div>
              </button>
            );
          })}

          {/* empty slots at the end - days from next month */}
          {Array.from({
            length: (7 - ((firstDay + daysInMonth) % 7)) % 7,
          }).map((_, i) => {
            const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
            const nextYear = calMonth === 11 ? calYear + 1 : calYear;
            const day = i + 1;
            return (
              <div
                key={`empty-next-${i}`}
                className="bg-white h-24 p-3 flex items-center justify-center text-gray-300 opacity-40"
              >
                <span className="text-sm font-semibold">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Dia selecionado</p>
            <p className="text-sm text-gray-500">{selectedISO ? formatBRDate(selectedISO) : ""}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_META.appointment.badge}`}>
                {dayCounts.appointment} agendamento(s)
              </span>
              <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_META.bill.badge}`}>
                {dayCounts.bill} conta(s)
              </span>
              <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_META.task.badge}`}>
                {dayCounts.task} tarefa(s)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedISO("")}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
            title="Limpar seleção"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl">
            {[
              { key: "all", label: "Tudo" },
              { key: "appointment", label: "Agendamento(s)" },
              { key: "bill", label: "Conta(s)" },
              { key: "task", label: "Tarefa(s)" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setFilter(t.key);
                  setShowAll(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === t.key ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="mt-4">
            {!selectedISO ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-medium">Selecione um dia no calendário</p>
                <p className="text-sm">para ver agendamentos, contas e tarefas</p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="font-medium">Nada por aqui</p>
                <p className="text-sm mt-2">Clique no botão abaixo para adicionar uma tarefa</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {displayedEvents.map((e) => {
                    const meta = TYPE_META[e.type] || TYPE_META.task;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-gray-700" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-gray-900 truncate">
                                {e.title}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {e.time && (
                                  <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                                    {e.time}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleEditEvent(e);
                                  }}
                                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-lg ${meta.badge}`}>
                                {meta.label}
                              </span>
                              {e.status && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                                  {e.status}
                                </span>
                              )}
                              {typeof e.amount === "number" && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                                  {formatMoneyBR(e.amount)}
                                </span>
                              )}
                              {e?.meta?.service && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                                  {e.meta.service}
                                </span>
                              )}
                            </div>

                            {e?.meta?.phone && (
                              <p className="text-xs text-gray-500 mt-2">
                                {e.meta.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Botão camuflado de exibir mais */}
                {hasMoreItems && !showAll && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
                  >
                    +{selectedEvents.length - 3} item(ns) · clique para ver mais
                  </button>
                )}

                {hasMoreItems && showAll && (
                  <button
                    type="button"
                    onClick={() => setShowAll(false)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
                  >
                    mostrar menos
                  </button>
                )}
              </div>
            )}

            {/* Botão Nova Tarefa */}
            {selectedISO && (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setEditingTask({ date: selectedISO });
                    setShowTaskModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl gap-2 transition-all hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Tarefa */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Modal de Agendamento */}
      {showAppointmentModal && (
        <AppointmentModal
          appointment={editingAppointment}
          onClose={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
        />
      )}

      {/* Modal de Transação/Conta */}
      {showTransactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
}