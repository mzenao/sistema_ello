import { useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/services/api";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (obj, fn) => (e) => fn({ ...obj, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      setLoading(true);
      
      if (!loginData.email || !loginData.password) {
        setError("Email e senha são obrigatórios");
        return;
      }
      
      await login(loginData.email, loginData.password);
      setSuccess("Login realizado com sucesso!");
      
      // Fechar modal e notificar que login foi bem-sucedido
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
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
              Login
            </h2>
            <button onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {/* Mensagens de erro */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mensagens de sucesso */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={loginData.email}
                onChange={set(loginData, setLoginData)}
                disabled={loading}
                placeholder="seu@email.com"
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
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processando..." : "Entrar"}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Apenas funcionários podem acessar a plataforma.
            </p>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}