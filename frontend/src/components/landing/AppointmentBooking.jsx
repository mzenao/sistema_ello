import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createAppointment } from "../../services/api";

const SERVICES = [
  { value: 'consulta', label: 'Consulta', duration: '30 min' },
  { value: 'clareamento', label: 'Clareamento', duration: '1h' },
  { value: 'ortodontia', label: 'Ortodontia', duration: '1h' },
  { value: 'implante', label: 'Implante', duration: '2h' },
  { value: 'lentes', label: 'Lentes de Contato', duration: '1h' },
  { value: 'prevencao', label: 'Limpeza / Prevenção', duration: '1h' },
  { value: 'canal', label: 'Canal', duration: '1h30' }
];

const TIMES = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'
];

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

export default function AppointmentBooking({ onClose }) {
  const today = new Date();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();

  const isPast = (day) => {
    const date = new Date(calYear, calMonth, day);
    date.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    return date < now;
  };

  const isSunday = (day) =>
    new Date(calYear, calMonth, day).getDay() === 0;

  const formatDate = () => {
    if (!selectedDate) return '';
    return `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await createAppointment({
        patient_name: form.name,
        patient_phone: form.phone,
        patient_email: form.email,
        service: selectedService.value,
        date: formatDate(),
        time: selectedTime,
        status: 'agendado'
      });

      setDone(true);
    } catch (err) {
      setError(err.message || 'Erro ao enviar agendamento. Tente novamente.');
      console.error('Erro ao criar agendamento:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else setCalMonth(m => m + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Agendar Consulta</h2>
            {!done && (
              <p className="text-sm text-gray-500">Passo {step} de 3</p>
            )}
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">

          {done ? (
            <div className="text-center py-10">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                Agendamento realizado!
              </h3>
              <p className="text-gray-500">
                Entraremos em contato para confirmar.
              </p>
              <Button onClick={onClose} className="mt-6">
                Fechar
              </Button>
            </div>
          ) : (

          <>
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h3 className="mb-4 font-semibold">
                <Calendar className="inline w-4 mr-2 text-teal-500"/>
                Escolha o serviço
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {SERVICES.map(service => (
                  <button
                    key={service.value}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-xl border ${
                      selectedService?.value === service.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="font-medium">{service.label}</p>
                    <p className="text-sm text-gray-500">
                      {service.duration}
                    </p>
                  </button>
                ))}
              </div>

              <Button
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="w-full mt-6"
              >
                Próximo
              </Button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <h3 className="mb-4 font-semibold">
                <Clock className="inline w-4 mr-2 text-teal-500"/>
                Escolha data e horário
              </h3>

              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={prevMonth}>
                    <ChevronLeft />
                  </button>
                  <span className="font-medium">
                    {MONTHS[calMonth]} {calYear}
                  </span>
                  <button onClick={nextMonth}>
                    <ChevronRight />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                  {WEEKDAYS.map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {[...Array(firstDay)].map((_,i) => <div key={i} />)}

                  {[...Array(daysInMonth)].map((_,i) => {
                    const day = i + 1;
                    const disabled = isPast(day) || isSunday(day);
                    const selected = selectedDate === day;

                    return (
                      <button
                        key={day}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                        }}
                        className={`p-2 rounded-lg text-sm ${
                          disabled
                            ? 'text-gray-300'
                            : selected
                            ? 'bg-teal-500 text-white'
                            : 'hover:bg-teal-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {TIMES.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-sm ${
                        selectedTime === time
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 hover:bg-teal-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Próximo
                </Button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <h3 className="mb-4 font-semibold">
                <User className="inline w-4 mr-2 text-teal-500"/>
                Seus dados
              </h3>

              <div className="space-y-3">
                <Input
                  placeholder="Nome completo"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
                <Input
                  placeholder="Telefone"
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                />
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mt-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  disabled={!form.name || !form.phone || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Enviando...' : 'Confirmar'}
                </Button>
              </div>
            </>
          )}
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
}