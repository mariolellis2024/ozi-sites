import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGA4 } from './hooks/useGA4';
import { useMetaPixel } from './hooks/useMetaPixel';
import { SiteConfigProvider } from './context/SiteConfigContext';
import Splash from './pages/Splash';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPages from './pages/AdminPages';
import AdminPageEditor from './pages/AdminPageEditor';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminTemplate from './pages/AdminTemplate';
import AdminSettings from './pages/AdminSettings';
import AdminTracking from './pages/AdminTracking';
import AdminModels from './pages/AdminModels';
import AdminSales from './pages/AdminSales';
import AdminPassword from './pages/AdminPassword';
import VisualEditor from './pages/VisualEditor';
import DynamicPage from './pages/DynamicPage';
import DynamicObrigado from './pages/DynamicObrigado';
import TemplatePreview from './pages/TemplatePreview';

function AppRoutes() {
  // Initialize GA4 tracking (only fires on public pages)
  useGA4();
  useMetaPixel();

  return (
    <Routes>
      {/* Root - splash (logo only) */}
      <Route path="/" element={<Splash />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pages" element={<AdminPages />} />
      <Route path="/admin/pages/:id" element={<AdminPageEditor />} />
      <Route path="/admin/pages/:id/visual/:type" element={<VisualEditor />} />
      <Route path="/admin/template" element={<AdminTemplate />} />
      <Route path="/admin/integrations" element={<AdminIntegrations />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/tracking" element={<AdminTracking />} />
      <Route path="/admin/models" element={<AdminModels />} />
      <Route path="/admin/sales" element={<AdminSales />} />
      <Route path="/admin/password" element={<AdminPassword />} />
      <Route path="/admin/preview/template/:source/:id/:type" element={<TemplatePreview />} />

      {/* Public - dynamic (catch-all, must be last) */}
      <Route path="/:slug" element={<DynamicPage />} />
      <Route path="/:slug/obrigado" element={<DynamicObrigado />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteConfigProvider>
        <AppRoutes />
      </SiteConfigProvider>
    </BrowserRouter>
  );
}
