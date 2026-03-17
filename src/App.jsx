import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Páginas temporárias até concluí-las
import Dashboard from './pages/Dashboard';
import Ofertas from './pages/Ofertas';
import Clientes from './pages/Clientes';
import Templates from './pages/Templates';
import Disparos from './pages/Disparos';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-8 max-w-7xl mx-auto min-h-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/disparos" element={<Disparos />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
