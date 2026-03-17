import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, Users, MessageSquareText, CalendarRange, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/ofertas', label: 'Ofertas Recebidas', icon: <CalendarRange size={20} /> },
    { to: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { to: '/templates', label: 'Templates de Mensagens', icon: <MessageSquareText size={20} /> },
    { to: '/disparos', label: 'Disparos Realizados', icon: <Send size={20} /> },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300">
      
      {/* Branding / Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800">
        <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Send className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-zinc-100 font-bold text-lg leading-tight">Mais Show</h1>
          <p className="text-zinc-500 text-xs font-medium">Notificações</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600/10 text-brand-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`${isActive ? 'text-brand-500' : 'text-zinc-500'} transition-colors`}>
                  {item.icon}
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-950 rounded-lg p-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-zinc-400">Sistema Online</span>
        </div>
      </div>

    </aside>
  );
}
