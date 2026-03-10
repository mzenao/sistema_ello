import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo_ello.png";
import { getStoredUser, logout } from "@/services/api";
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  Menu,
  LogOut,
  ChevronRight,
  Stethoscope,
  ContactRound,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { name: "Calendario", icon: Calendar, label: "Calendário", to: "/admin/calendario" },
  { name: "Agendamentos", icon: Stethoscope, label: "Agendamentos", to: "/admin/agendamentos" },
  { name: "Pacientes", icon: Users, label: "Pacientes", to: "/admin/pacientes" },
  { name: "Financeiro", icon: TrendingUp, label: "Financeiro", to: "/admin/financeiro" },
  { name: "Relatorios", icon: BarChart3, label: "Relatórios", to: "/admin/relatorios" },
  { name: "Funcionarios", icon: ContactRound, label: "Funcionários", to: "/admin/funcionarios" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Descobre qual item está ativo pelo pathname
  const currentItem = useMemo(() => {
    const path = location.pathname;
    // match exato primeiro
    const exact = navItems.find((i) => i.to === path);
    if (exact) return exact;
    // fallback: match por prefixo (ex: /admin/agendamentos/123)
    const prefix = navItems.find((i) => i.to !== "/admin" && path.startsWith(i.to));
    if (prefix) return prefix;
    // default: dashboard
    return navItems[0];
  }, [location.pathname]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-800">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <img src={logo} alt="Logo Odonto Ello" className="w-6 h-6 object-contain scale-250" />
            </div>
          </div>
          <div>
            <p className="font-bold text-lg">
              Odonto<span className="text-teal-400">Ello</span>
            </p>
            <p className="text-gray-400 text-xs">Sistema Interno</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentItem?.name === item.name;

            return (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-800">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {user.full_name?.[0] || user.email?.[0] || "U"}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {user.full_name || "Usuário"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.role === "admin" ? "Administrador" : "Recepcionista"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-2 py-2 w-full rounded-lg hover:bg-gray-800 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">
              {currentItem?.label || "Sistema Interno"}
            </h1>
          </div>

          <Link to="/" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            ← Ver site público
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}