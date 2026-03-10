import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function Contact() {

  const whatsappNumber = "5532984028138"; // Coloque seu número com DDD e 55
  const message = "Olá, gostaria de agendar uma consulta!";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Entre em Contato
          </h2>
          <p className="text-gray-600">
            Fale conosco diretamente pelo WhatsApp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* Informações */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <MapPin className="text-teal-600" />
              <div>
                <p className="font-semibold">Endereço</p>
                <p className="text-gray-600 text-sm">
                  Av. Senhor dos Passos 1366 - São Pedro, Juiz de Fora - MG
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Phone className="text-teal-600" />
              <div>
                <p className="font-semibold">Telefone</p>
                <p className="text-gray-600 text-sm">
                  (32) 99999-9999
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Mail className="text-teal-600" />
              <div>
                <p className="font-semibold">E-mail</p>
                <p className="text-gray-600 text-sm">
                  contato@clinica.com
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Clock className="text-teal-600" />
              <div>
                <p className="font-semibold">Horário</p>
                <p className="text-gray-600 text-sm">
                  Seg–Sex: 8h às 18h
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center items-center text-center"
          >
            <div className="mb-6">
              <MessageCircle className="w-16 h-16 text-teal-600 mx-auto" />
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Agende sua consulta agora
            </h3>

            <p className="text-gray-600 mb-8 max-w-md">
              Atendimento rápido e personalizado direto no WhatsApp.
            </p>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-full text-lg font-medium transition flex items-center gap-3 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}