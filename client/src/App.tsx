import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGA4 } from './hooks/useGA4';
import Home from './pages/Home';
import Obrigado from './pages/Obrigado';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPages from './pages/AdminPages';
import AdminPageEditor from './pages/AdminPageEditor';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminTemplate from './pages/AdminTemplate';
import VisualEditor from './pages/VisualEditor';
import DynamicPage from './pages/DynamicPage';
import DynamicObrigado from './pages/DynamicObrigado';

function AppRoutes() {
  // Initialize GA4 tracking (only fires on public pages)
  useGA4();

  return (
    <Routes>
      {/* Public - static */}
      <Route path="/" element={<Home />} />
      <Route path="/obrigado" element={<Obrigado />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pages" element={<AdminPages />} />
      <Route path="/admin/pages/:id" element={<AdminPageEditor />} />
      <Route path="/admin/pages/:id/visual/:type" element={<VisualEditor />} />
      <Route path="/admin/template" element={<AdminTemplate />} />
      <Route path="/admin/integrations" element={<AdminIntegrations />} />

      {/* Public - dynamic (catch-all, must be last) */}
      <Route path="/:slug" element={<DynamicPage />} />
      <Route path="/:slug/obrigado" element={<DynamicObrigado />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
