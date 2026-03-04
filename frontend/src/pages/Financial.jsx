import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TransactionModal from '@/components/internal/TransactionModal.jsx';

const STORAGE_KEY = 'odontoello_transactions_v1';

const categoryLabels = {
  consulta: 'Consulta', procedimento: 'Procedimento', convenio: 'Convênio',
  aluguel: 'Aluguel', salario: 'Salário', material: 'Material',
  equipamento: 'Equipamento', marketing: 'Marketing', servicos: 'Serviços', outro: 'Outro'
};

const paymentLabels = {
  dinheiro: 'Dinheiro', cartao_credito: 'Cartão Crédito', cartao_debito: 'Cartão Débito',
  pix: 'PIX', transferencia: 'Transferência', convenio: 'Convênio'
};


function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTransactions;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedTransactions;
  } catch {
    return seedTransactions;
  }
}

function saveTransactions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid(prefix = 't') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function Financeiro() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));

  const [showModal, setShowModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = loadTransactions()
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const normalized = data.map(t => ({
      ...t,
      dateDisplay: t.date
        ? new Date(t.date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "",
    }));

    setTransactions(normalized);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter(t => {
      const matchSearch =
        !q ||
        t.description?.toLowerCase().includes(q) ||
        t.patient_name?.toLowerCase().includes(q);

      const matchType = typeFilter === 'todos' || t.type === typeFilter;
      const matchMonth = !monthFilter || (t.date || '').startsWith(monthFilter);

      return matchSearch && matchType && matchMonth;
    });
  }, [transactions, search, typeFilter, monthFilter]);

  const revenue = useMemo(
    () => filtered.filter(t => t.type === 'receita').reduce((s, t) => s + (Number(t.amount) || 0), 0),
    [filtered]
  );
  const expenses = useMemo(
    () => filtered.filter(t => t.type === 'despesa').reduce((s, t) => s + (Number(t.amount) || 0), 0),
    [filtered]
  );
  const balance = revenue - expenses;

  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const handleDelete = async (id) => {
    if (!confirm('Remover esta transação?')) return;
    const next = transactions.filter(t => t.id !== id);
    setTransactions(next);
    saveTransactions(next);
  };

  const handleSave = async (payload) => {
    const clean = {
      ...payload,
      amount: Number(payload.amount) || 0,
      date: payload.date || format(new Date(), 'yyyy-MM-dd'), // ISO seguro
      description: payload.description?.trim() || 'Sem descrição'
    };

    const withDisplay = {
      ...clean,
      dateDisplay: new Date(clean.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    let next = [];

    if (editingTxn?.id) {
      next = transactions.map(t =>
        t.id === editingTxn.id ? { ...t, ...withDisplay } : t
      );
    } else {
      next = [{ id: uid(), ...withDisplay }, ...transactions];
    }

    next = next.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    setTransactions(next);
    saveTransactions(next);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Receitas', value: revenue, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Despesas', value: expenses, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Saldo', value: balance, icon: DollarSign, color: balance >= 0 ? 'text-blue-600' : 'text-orange-600', bg: balance >= 0 ? 'bg-blue-50' : 'bg-orange-50' }
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{loading ? '...' : fmt(s.value)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 w-48"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>

          <Input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="rounded-xl border-gray-200 w-40"
          />
        </div>

        <Button
          onClick={() => { setEditingTxn(null); setShowModal(true); }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Transação
        </Button>
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(txn => (
                <div key={txn.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    txn.type === 'receita' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {txn.type === 'receita'
                      ? <TrendingUp className="w-5 h-5 text-green-600" />
                      : <TrendingDown className="w-5 h-5 text-red-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{txn.description}</p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{txn.dateDisplay}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded-md">
                        {categoryLabels[txn.category] || 'Outro'}
                      </span>
                      {txn.payment_method && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded-md">
                          {paymentLabels[txn.payment_method] || txn.payment_method}
                        </span>
                      )}
                      {txn.patient_name && (
                        <span className="text-xs text-gray-400">· {txn.patient_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`font-bold ${txn.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'receita' ? '+' : '-'}{fmt(txn.amount)}
                    </span>

                    <Badge
                      className={
                        txn.status === 'pago'
                          ? 'bg-green-100 text-green-700'
                          : txn.status === 'pendente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {txn.status || '—'}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingTxn(txn); setShowModal(true); }}
                      className="w-8 h-8 text-gray-400 hover:text-teal-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(txn.id)}
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
        <TransactionModal
          transaction={editingTxn}
          onClose={() => setShowModal(false)}
          onSave={(dataFromModal) => {
            setShowModal(false);
            handleSave(dataFromModal);
          }}
        />
      )}
    </div>
  );
}