import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Award, Star } from "lucide-react";
import logo from "@/assets/logo_ello.png";

/* =========================
   Dados (futuro backend)
========================= */

const stats = [
  { value: "15+", label: "Anos de Experiência" },
  { value: "2000+", label: "Pacientes Atendidos" },
  { value: "98%", label: "Satisfação" },
];

const avatars = ["M", "J", "A", "C"];

/* =========================
   Animações reutilizáveis
========================= */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const floatingAnimation = {
  y: [0, -5, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function Hero({ onOpenBooking }) {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500" />

      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwIDEgMSAwIDEgMCAwLTIgMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ================= LEFT CONTENT ================= */}
          <div className="text-center lg:text-left">
            <motion.div
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-white/90 text-sm font-medium">
                Tecnologia de Ponta em Odontologia
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Seu sorriso merece o melhor cuidado!
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="text-lg text-white/80 mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Na Odonto Ello, combinamos expertise profissional com tecnologia
              avançada para transformar sua experiência odontológica em algo
              único e especial.
            </motion.p>

            <motion.div
              {...fadeUp(0.3)}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={onOpenBooking}
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm"
              >
                Agende sua Consulta
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                onClick={() => window.location.href = "#about"}
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm"
              >
                Conheça a Clínica
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              {...fadeUp(0.4)}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ================= RIGHT CONTENT ================= */}
          <div className="relative hidden lg:block">
            <motion.div animate={floatingAnimation}>
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
                      <img
                        src={logo}
                        alt="Logo Odonto Ello"
                        className="w-24 h-24 scale-300 object-contain -ml-1"
                      />
                    </div>
                    <p className="text-white/90 font-medium">
                      Cuidado Premium
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      para seu sorriso
                    </p>
                  </div>
                </div>

                {/* Floating Card 1 */}
                <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Segurança</p>
                      <p className="text-sm text-gray-500">
                        Protocolos rigorosos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute -right-24 top-40 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Premiada</p>
                      <p className="text-sm text-gray-500">
                        Excelência reconhecida
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 3 */}
                <div className="absolute left-10 -bottom-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {avatars.map((letter, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 border-2 border-white flex items-center justify-center"
                        >
                          <span className="text-white text-xs font-medium">
                            {letter}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Google Reviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}