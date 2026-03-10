import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TransactionModal({ transaction, onClose, onSave }) {
  const initial = useMemo(() => {
    const base = {
      type: 'receita',
      category: 'consulta',
      description: '',
      amount: '',
      date: todayISO(),
      payment_method: 'pix',
      status: 'pago',
      patient_name: '',
      notes: ''
    };

    if (!transaction) return base;

    return {
      ...base,
      ...transaction,
      amount:
        transaction.amount === 0 || transaction.amount
          ? String(transaction.amount)
          : '',
      date: transaction.date || todayISO()
    };
  }, [transaction]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTypeChange = (t) => {
    // mantém o visual e evita categoria inválida ao trocar tipo
    const nextCategory =
      t === 'receita'
        ? (['consulta', 'procedimento', 'convenio', 'outro'].includes(form.category) ? form.category : 'consulta')
        : (['aluguel', 'salario', 'material', 'equipamento', 'marketing', 'servicos', 'outro'].includes(form.category) ? form.category : 'aluguel');

    setForm(f => ({
      ...f,
      type: t,
      category: nextCategory,
      // se virou despesa, paciente não é necessário
      patient_name: t === 'receita' ? f.patient_name : ''
    }));
  };

  const parseAmount = (value) => {
    if (value === '' || value == null) return NaN;
    // aceita "10,50" e "10.50"
    const normalized = String(value).replace(/\./g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const amountNum = parseAmount(form.amount);

    // validações básicas pro protótipo
    if (!form.description?.trim()) return alert('Preencha a descrição.');
    if (!Number.isFinite(amountNum) || amountNum <= 0) return alert('Informe um valor válido.');
    if (!form.date) return alert('Selecione a data.');

    setSaving(true);

    const payload = {
      ...(transaction?.id && { id: transaction.id }),
      type: form.type,
      category: form.category,
      description: form.description.trim(),
      amount: amountNum,
      date: form.date,
      payment_method: form.payment_method,
      status: form.status,
      patient_name: form.type === 'receita' ? (form.patient_name || '').trim() : '',
      notes: (form.notes || '').trim()
    };

    // onSave salva no pai (localStorage no Financial.jsx)
    await Promise.resolve(onSave(payload));

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {['receita', 'despesa'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  form.type === t
                    ? t === 'receita'
                      ? 'bg-green-500 text-white shadow'
                      : 'bg-red-500 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t === 'receita' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <Input
                value={form.description}
                onChange={e => set('description', e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <Input
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                required
                className="rounded-xl"
                placeholder="Ex: 150,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <Input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {form.type === 'receita' ? (
                  <>
                    <option value="consulta">Consulta</option>
                    <option value="procedimento">Procedimento</option>
                    <option value="convenio">Convênio</option>
                    <option value="outro">Outro</option>
                  </>
                ) : (
                  <>
                    <option value="aluguel">Aluguel</option>
                    <option value="salario">Salário</option>
                    <option value="material">Material</option>
                    <option value="equipamento">Equipamento</option>
                    <option value="marketing">Marketing</option>
                    <option value="servicos">Serviços</option>
                    <option value="outro">Outro</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={form.payment_method}
                onChange={e => set('payment_method', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="pix">PIX</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão Crédito</option>
                <option value="cartao_debito">Cartão Débito</option>
                <option value="transferencia">Transferência</option>
                <option value="convenio">Convênio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {form.type === 'receita' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <Input
                  value={form.patient_name}
                  onChange={e => set('patient_name', e.target.value)}
                  placeholder="Nome do paciente"
                  className="rounded-xl"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <Textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={`flex-1 rounded-xl text-white ${
                form.type === 'receita' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}