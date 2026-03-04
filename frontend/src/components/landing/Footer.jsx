import React from 'react';
import { motion } from 'framer-motion';
import logo from "@/assets/logo_ello.png";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
  ArrowUp
} from 'lucide-react';

const socialLinks = [
  { icon: Instagram, href: '#' },
  { icon: Facebook, href: '#' },
  { icon: MessageCircle, href: '#' },
  { icon: Youtube, href: '#' }
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <img src={logo} alt="Logo Odonto Ello" className="w-40 h-40 scale-150 object-contain" />
              </div>
              <span className="font-bold text-2xl tracking-tight">
                Odonto<span className="text-teal-400">Ello</span>
              </span>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Clínica odontológica especializada em estética, implantes e
              reabilitação oral em Juiz de Fora.
            </p>

            <div className="space-y-1 text-sm text-gray-400">
              <p>CNPJ: 00.000.000/0001-00</p>
              <p>Responsável Técnico: Dr. </p>
              <p>CRO-MG: 12345</p>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-semibold text-white mb-6">Especialidades</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Clareamento Dental</li>
              <li>Implantes Dentários</li>
              <li>Ortodontia</li>
              <li>Lentes de Contato Dental</li>
              <li>Tratamento de Canal</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-white mb-6">Contato</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Av. Senhor dos Passos 1366</li>
              <li>São Pedro, Juiz de Fora - MG</li>
              <li>(32) 99999-9999</li>
              <li>contato@clinica.com</li>
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h3 className="font-semibold text-white mb-6">Redes Sociais</h3>

            <div className="flex gap-3 mb-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            <p className="text-gray-500 text-sm">
              Atendimento de segunda a sexta das 8h às 18h.
            </p>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 Odonto Ello. Todos os direitos reservados.
          </p>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}