import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Users, Clock, Award } from "lucide-react";
import clinicaInterior from "../../assets/clinica_interior.png";

const features = [
  "Equipe especializada e atualizada",
  "Tecnologia moderna e segura",
  "Ambiente confortável e acolhedor",
  "Atendimento humanizado",
  "Resultados naturais e duradouros",
];

const stats = [
  { icon: Users, value: "2.000+", label: "Pacientes Atendidos" },
  { icon: Clock, value: "10+", label: "Anos de Experiência" },
  { icon: Award, value: "100%", label: "Compromisso com Qualidade" },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* IMAGEM */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">
                <img src={clinicaInterior} alt="Imagem da Clínica" className="w-full h-full object-cover" />
              </span>
            </div>
          </motion.div>

          {/* TEXTO */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Sobre a Clínica
            </h2>

            <p className="text-gray-600 mb-6">
              Atuamos há mais de 10 anos oferecendo tratamentos odontológicos
              modernos com foco na saúde e bem-estar dos nossos pacientes.
              Nossa missão é proporcionar atendimento de excelência com
              tecnologia e cuidado humanizado.
            </p>

            {/* LISTA */}
            <div className="space-y-3 mb-8">
              {features.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 rounded-xl border"
            >
              <stat.icon className="w-8 h-8 mx-auto text-teal-600 mb-3" />
              <p className="text-2xl font-bold text-gray-800">
                {stat.value}
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}