import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Luisa Guimarães",
    text: "Fui muito bem atendida desde a recepção até o final do tratamento. A equipe é extremamente profissional e atenciosa.",
  },
  {
    name: "João Pedro Reis",
    text: "Sempre tive medo de dentista, mas aqui me senti seguro e confortável. Recomendo para toda minha família.",
  },
  {
    name: "Diana Costa",
    text: "Estrutura moderna e atendimento excelente. Meu tratamento foi rápido e com ótimo resultado.",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Depoimentos de Pacientes
        </h2>

        <p className="text-gray-600 mb-12">
          A satisfação dos nossos pacientes é nossa maior prioridade.
        </p>

        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 rounded-xl shadow-md"
        >
          {/* Estrelas */}
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>

          {/* Texto */}
          <p className="text-gray-700 text-lg mb-6">
            "{testimonials[index].text}"
          </p>

          {/* Nome */}
          <p className="font-semibold text-gray-800">
            {testimonials[index].name}
          </p>
        </motion.div>

        {/* Navegação */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="p-3 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={next}
            className="p-3 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

