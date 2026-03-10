import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo_ello.png";
import AuthModal from "@/components/internal/loginModal.jsx";
import { isAuthenticated, getStoredUser, logout } from "@/services/api";

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();

  // Verificar autenticação ao montar
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser();
        setUser(storedUser);
      } else {
        setUser(null);
      }
    };

    checkAuth();

    // Verificar mudanças no localStorage
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginSuccess = () => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsMobileMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  const navItems = [
    { label: "Início", id: "hero" },
    { label: "Serviços", id: "services" },
    { label: "Sobre", id: "about" },
    { label: "Depoimentos", id: "testimonials" },
    { label: "Contato", id: "contact" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <img
              src={logo}
              alt="Odonto Ello"
              className={`h-10 w-auto scale-150 transition-all duration-300 ${
                isScrolled ? "brightness-0" : ""
              }`}
            />

            <div className="font-bold text-xl">
              <span
                className={`font-semibold text-lg ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
              >
                Odonto<span className="text-teal-500">Ello</span>
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-600 hover:text-teal-600"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">

            <Button
              onClick={onOpenBooking}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
            >
              <Phone className="w-4 h-4 mr-2" />
              Agendar
            </Button>

            
            {user ? (
              <>
                <Link to="/admin">
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowAuth(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 top-16 z-30 bg-white shadow-xl rounded-b-3xl mx-4 p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 hover:text-teal-600 font-medium py-2 text-left"
                >
                  {item.label}
                </button>
              ))}

              {user ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      className="bg-teal-600 text-white rounded-full w-full mb-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="bg-teal-600 text-white rounded-full w-full mb-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowAuth(true);
                  }}
                  className="bg-teal-600 text-white rounded-full w-full mb-2"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}

              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenBooking?.();
                }}
                className="bg-teal-600 text-white rounded-full w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* modal de autenticação */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}