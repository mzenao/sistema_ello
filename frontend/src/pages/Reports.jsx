import React, { useMemo, useState, useEffect } from 'react';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { listAppointments, listTransactions } from '@/services/api';

const COLORS = ['#14b8a6', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f97316'];

const serviceLabels = {
  clareamento: 'Clareamento',
  implante: 'Implante',
  ortodontia: 'Ortodontia',
  canal: 'Canal',
  lentes: 'Lentes',
  prevencao: 'Prevenção',
  consulta: 'Consulta',
  outro: 'Outro'
};

export default function Relatorios() {
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados da API
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        
        const [appts, txns] = await Promise.all([
          listAppointments({ limit: 500, signal: controller.signal }).catch(() => []),
          listTransactions({ limit: 500, signal: controller.signal }).catch(() => []),
        ]);

        setAppointments(Array.isArray(appts) ? appts : appts?.data ?? []);
        setTransactions(Array.isArray(txns) ? txns : txns?.data ?? []);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Erro ao carregar dados do relatório:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  // Últimos 6 meses
  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });
  }, []);

  const monthlyData = useMemo(() => {
    return months.map(month => {
      const key = format(month, 'yyyy-MM');
      const label = format(month, 'MMM', { locale: ptBR });

      const revenue = transactions
        .filter(t => t.type === 'receita' && t.date?.startsWith?.(key))
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const expenses = transactions
        .filter(t => t.type === 'despesa' && t.date?.startsWith?.(key))
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);

      const appts = appointments.filter(a => a.date?.startsWith?.(key)).length;

      return { label, revenue, expenses, balance: revenue - expenses, appts };
    });
  }, [months, transactions, appointments]);

  const serviceData = useMemo(() => {
    const counts = {};
    for (const a of appointments) {
      const name = serviceLabels[a.service] || 'Outro';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [appointments]);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentRevenue = transactions
    .filter(t => t.type === 'receita' && t.date?.startsWith?.(currentMonthKey))
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const currentExpenses = transactions
    .filter(t => t.type === 'despesa' && t.date?.startsWith?.(currentMonthKey))
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const currentAppts = appointments.filter(a => a.date?.startsWith?.(currentMonthKey)).length;

  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  const hasAnyData = appointments.length > 0 || transactions.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Receita este mês', value: fmt(currentRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Despesas este mês', value: fmt(currentExpenses), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Agendamentos este mês', value: currentAppts, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' }
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sem dados */}
      {!hasAnyData && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 text-center text-gray-500">
            <p className="font-medium">Ainda não há dados para gerar relatórios.</p>
            <p className="text-sm mt-1">Crie alguns agendamentos e transações para alimentar os gráficos.</p>
          </CardContent>
        </Card>
      )}

      {/* Revenue vs Expenses Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Receitas x Despesas (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} />
              <Legend />
              <Bar dataKey="revenue" name="Receitas" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly balance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Saldo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Saldo']} />
                <Line type="monotone" dataKey="balance" name="Saldo" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Serviços mais Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>Sem dados ainda</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={serviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                      {serviceData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-2">
                  {serviceData.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                      <span className="text-xs font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointments per month */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Agendamentos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="appts" name="Agendamentos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}