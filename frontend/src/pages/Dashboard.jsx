import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth,} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { listAppointments, listTransactions } from "@/services/api";

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

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setErrorMsg("");

        const [appts, txns] = await Promise.all([
          listAppointments({ limit: 100, order: "-date", signal: controller.signal }),
          listTransactions({ limit: 200, order: "-date", signal: controller.signal }),
        ]);

        setAppointments(Array.isArray(appts) ? appts : appts?.data ?? []);
        setTransactions(Array.isArray(txns) ? txns : txns?.data ?? []);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setErrorMsg("Não foi possível carregar os dados do dashboard.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  // Função para formato ISO (seguro para comparações) - obter data local SEM fuso horário
const formatDateISO = (date) => {
  let d = date;
  if (typeof date === 'string') {
    // Se for string ISO, converter para data local
    d = new Date(date + 'T00:00:00');
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // "2026-03-10"
};

// Função para formato pt-BR (apenas exibição)
const formatDatePtBr = (date) => {
  let d = date;
  if (typeof date === 'string') {
    d = new Date(date + 'T00:00:00');
  }
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // "10/03/2026"
};

const {
  todayAppointments,
  monthRevenue,
  monthExpenses,
  monthBalance,
  monthTxCountRevenue,
  monthTxCountExpense,
} = useMemo(() => {
  const todayISO = formatDateISO(new Date());
  const todayAppointmentsLocal = appointments.filter(
    (a) => a.date === todayISO
  );

  // Definir início e fim do mês em ISO
  const now = new Date();
  const monthStart = formatDateISO(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = formatDateISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const monthTransactions = transactions.filter(
    (t) => t.date >= monthStart && t.date <= monthEnd
  );

  const revenueTx = monthTransactions.filter((t) => t.type === "receita");
  const expenseTx = monthTransactions.filter((t) => t.type === "despesa");

  const revenue = revenueTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const expenses = expenseTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);

  return {
    todayAppointments: todayAppointmentsLocal,
    monthRevenue: revenue,
    monthExpenses: expenses,
    monthBalance: revenue - expenses,
    monthTxCountRevenue: revenueTx.length,
    monthTxCountExpense: expenseTx.length,
    // Aqui você pode guardar também a versão pt-BR para exibir
    todayDisplay: formatDatePtBr(new Date()),
  };
}, [appointments, transactions]);

  const stats = [
    {
      title: "Agendamentos Hoje",
      value: todayAppointments.length,
      sub: `${todayAppointments.filter((a) => a.status === "confirmado").length} confirmados`,
      icon: Calendar,
      color: "from-teal-500 to-cyan-500",
      bg: "bg-teal-50",
    },
    {
      title: "Receita do Mês",
      value: `R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      sub: `${monthTxCountRevenue} transações`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
    },
    {
      title: "Despesas do Mês",
      value: `R$ ${monthExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      sub: `${monthTxCountExpense} transações`,
      icon: TrendingDown,
      color: "from-red-500 to-pink-500",
      bg: "bg-red-50",
    },
    {
      title: "Saldo do Mês",
      value: `R$ ${monthBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      sub: monthBalance >= 0 ? "Positivo ✓" : "Negativo ⚠",
      icon: DollarSign,
      color: monthBalance >= 0 ? "from-blue-500 to-indigo-500" : "from-orange-500 to-red-500",
      bg: monthBalance >= 0 ? "bg-blue-50" : "bg-orange-50",
    },
  ];

  if (errorMsg) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>

                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Agendamentos de Hoje</CardTitle>

            <Link to="/admin/agendamentos">
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 gap-1">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum agendamento hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 6).map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {appt.patient_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{appt.patient_name}</p>
                      <p className="text-xs text-gray-500">
                        {appt.time} · {serviceLabels[appt.service] || "Serviço"}
                      </p>
                    </div>

                    <Badge className={`text-xs ${statusColors[appt.status] || "bg-gray-100 text-gray-700"}`}>
                      {appt.status || "—"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Transações Recentes</CardTitle>

            <Link to="/admin/financeiro">
              <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma transação registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 6).map((txn) => (
                  <div key={txn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        txn.type === "receita" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {txn.type === "receita" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{txn.description || "—"}</p>
                      <p className="text-xs text-gray-500">{formatDatePtBr(new Date(txn.date))}</p>
                    </div>

                    <span
                      className={`font-semibold text-sm ${
                        txn.type === "receita" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {txn.type === "receita" ? "+" : "-"}R${" "}
                      {(Number(txn.amount) || 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}