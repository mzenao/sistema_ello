// filepath: frontend/src/App.jsx
// Router principal que mapeia as rotas da aplicação
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home.jsx";
import AdminLayout from "./layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Appointments from "./pages/Appointments.jsx";
import Patients from "./pages/Patients.jsx";
import Financeiro from "./pages/Financial.jsx";
import Relatorios from "./pages/Reports.jsx";
import Funcionarios from "./pages/Employees.jsx";
import Calendario from "./pages/CalendarHub.jsx"
import { isAuthenticated } from "./services/api";

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Página pública - landing page */}
      <Route path="/" element={<Home />} />

      {/* Rotas administrativas com layout sidebar */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><Dashboard/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/agendamentos" element={<ProtectedRoute><AdminLayout><Appointments/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/pacientes" element={<ProtectedRoute><AdminLayout><Patients/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/financeiro" element={<ProtectedRoute><AdminLayout><Financeiro/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/relatorios" element={<ProtectedRoute><AdminLayout><Relatorios/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/funcionarios" element={<ProtectedRoute><AdminLayout><Funcionarios/></AdminLayout></ProtectedRoute>}/>
      <Route path="/admin/calendario" element={<ProtectedRoute><AdminLayout><Calendario/></AdminLayout></ProtectedRoute>}/>
      
      {/* Fallback para rotas inválidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}