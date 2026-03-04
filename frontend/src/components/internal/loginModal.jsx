import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const set = (obj, fn) => (e) => fn({ ...obj, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (mode === "login" && onLogin) onLogin(loginData);
    if (mode === "register" && onRegister) onRegister(registerData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay escurecido */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* cabeçalho sticky com o X de fechar */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 flex items-center justify-between p-6 z-10">
            <h2 className="text-xl font-bold">
              {mode === "login" ? "Login" : "Cadastro"}
            </h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={submit} className="p-6 space-y-4">
            {mode === "login" ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={set(loginData, setLoginData)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Senha
                  </label>
                  <Input
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={set(loginData, setLoginData)}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome
                  </label>
                  <Input
                    name="name"
                    value={registerData.name}
                    onChange={set(registerData, setRegisterData)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={set(registerData, setRegisterData)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Senha
                  </label>
                  <Input
                    name="password"
                    type="password"
                    value={registerData.password}
                    onChange={set(registerData, setRegisterData)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirmar senha
                  </label>
                  <Input
                    name="confirm"
                    type="password"
                    value={registerData.confirm}
                    onChange={set(registerData, setRegisterData)}
                  />
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <Button type="submit" className="w-full sm:w-auto">
                {mode === "login" ? "Entrar" : "Cadastrar"}
              </Button>
              <button
                type="button"
                className="text-sm text-teal-600 hover:underline"
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login"
                  ? "Não tem conta? Cadastre‑se"
                  : "Já tem conta? Faça login"}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}