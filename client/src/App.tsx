import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Obrigado from './pages/Obrigado';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/obrigado" element={<Obrigado />} />
      </Routes>
    </BrowserRouter>
  );
}
