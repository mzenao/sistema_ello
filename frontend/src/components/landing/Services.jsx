import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Smile,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  Hospital,
} from "lucide-react";
import { redirect } from "react-router-dom";

const services = [
  {
    icon: Sparkles,
    title: "Clareamento Dental",
    description:
      "Tratamento moderno com tecnologia LED para um sorriso mais branco e natural.",
  },
  {
    icon: Shield,
    title: "Implantes Dentários",
    description:
      "Implantes seguros e duradouros com técnica minimamente invasiva.",
  },
  {
    icon: Smile,
    title: "Ortodontia",
    description:
      "Alinhamento dental com aparelhos tradicionais ou alinhadores invisíveis.",
  },
  {
    icon: Stethoscope,
    title: "Tratamento de Canal",
    description:
      "Procedimento seguro e confortável com equipamentos de alta precisão.",
  },
  {
    icon: HeartPulse,
    title: "Prevenção e Limpeza",
    description:
      "Checkups regulares para manter sua saúde bucal sempre em dia.",
  },
    {
    icon: Hospital,
    title: "Clínica Completa",
    description:
      "Atendimento completo em ambiente seguro e moderno.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Título */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossos Serviços
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos tratamentos odontológicos completos com tecnologia
            moderna e atendimento humanizado.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-teal-100 rounded-lg mb-4">
                <service.icon className="w-6 h-6 text-teal-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {service.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {service.description}
              </p>

              <button className="text-teal-600 text-sm font-medium inline-flex items-center hover:underline"
                onClick={() => window.location.href = "/appointment"}
              >
                Agendamento
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}