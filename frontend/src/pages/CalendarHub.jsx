import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Stethoscope,
  Receipt,
  CheckSquare,
} from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function pad2(n) {
  return String(n).padStart(2, "0");
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

// MOCK (depois você troca por fetch/estado global)
const mockEvents = [
  {
    id: "a1",
    type: "appointment",
    date: "2026-03-04",
    time: "09:00",
    title: "Consulta · João Pedro",
    status: "confirmado",
    meta: { phone: "(32) 99999-9999", service: "Consulta" },
  },
  {
    id: "a2",
    type: "appointment",
    date: "2026-03-04",
    time: "14:30",
    title: "Clareamento · Maria Clara",
    status: "agendado",
    meta: { service: "Clareamento" },
  },
  {
    id: "b1",
    type: "bill",
    date: "2026-03-04",
    title: "Fornecedor · Material",
    status: "pendente",
    amount: 320.5,
  },
  {
    id: "t1",
    type: "task",
    date: "2026-03-04",
    title: "Conferir estoque (luvas/máscaras)",
    status: "aberta",
  },
  {
    id: "b2",
    type: "bill",
    date: "2026-03-10",
    title: "Aluguel",
    status: "pendente",
    amount: 1800,
  },
  {
    id: "a3",
    type: "appointment",
    date: "2026-03-10",
    time: "10:00",
    title: "Canal · Ricardo",
    status: "confirmado",
    meta: { service: "Canal" },
  },
];

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
  events = mockEvents,
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [selectedISO, setSelectedISO] = useState(
    toISODate(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [filter, setFilter] = useState("all"); // all | appointment | bill | task

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
                {dayCounts.appointment} agendamentos
              </span>
              <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_META.bill.badge}`}>
                {dayCounts.bill} contas
              </span>
              <span className={`text-xs px-2 py-1 rounded-lg ${TYPE_META.task.badge}`}>
                {dayCounts.task} tarefas
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
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {[
              { key: "all", label: "Tudo" },
              { key: "appointment", label: "Agendamento" },
              { key: "bill", label: "Contas" },
              { key: "task", label: "Tarefas" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
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
                <p className="text-sm">Nenhum item para este filtro</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {selectedEvents.map((e) => {
                    const meta = TYPE_META[e.type] || TYPE_META.task;
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50"
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
                              {e.time && (
                                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium flex-shrink-0">
                                  {e.time}
                                </span>
                              )}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}