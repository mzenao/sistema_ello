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

export default function App() {
  return (
    <Routes>
      {/* Página pública - landing page */}
      <Route path="/" element={<Home />} />

      {/* Rotas administrativas com layout sidebar */}
      <Route path="/admin" element={<AdminLayout><Dashboard/></AdminLayout>}/>
      <Route path="/admin/agendamentos" element={<AdminLayout><Appointments/></AdminLayout>}/>
      <Route path="/admin/pacientes" element={<AdminLayout><Patients/></AdminLayout>}/>
      <Route path="/admin/financeiro" element={<AdminLayout><Financeiro/></AdminLayout>}/>
      <Route path="/admin/relatorios" element={<AdminLayout><Relatorios/></AdminLayout>}/>
      <Route path="/admin/funcionarios" element={<AdminLayout><Funcionarios/></AdminLayout>}/>
      <Route path="/admin/calendario" element={<AdminLayout><Calendario/></AdminLayout>}/>
      
      {/* Fallback para rotas inválidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}