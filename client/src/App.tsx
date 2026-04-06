import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Obrigado from './pages/Obrigado';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPages from './pages/AdminPages';
import AdminPageEditor from './pages/AdminPageEditor';
import DynamicPage from './pages/DynamicPage';
import DynamicObrigado from './pages/DynamicObrigado';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public - static */}
        <Route path="/" element={<Home />} />
        <Route path="/obrigado" element={<Obrigado />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/pages/:id" element={<AdminPageEditor />} />

        {/* Public - dynamic (catch-all, must be last) */}
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="/:slug/obrigado" element={<DynamicObrigado />} />
      </Routes>
    </BrowserRouter>
  );
}
