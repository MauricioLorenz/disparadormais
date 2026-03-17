import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, LayoutDashboard } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [resumo, setResumo] = useState({ total: 0, sucessos: 0, erros: 0 });
  const [disparos, setDisparos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const respResumo = await api.get('/disparos/resumo');
      const respDisparos = await api.get('/disparos');
      
      setResumo(respResumo.data);
      setDisparos(respDisparos.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'SUCESSO') return <CheckCircle2 className="text-emerald-500" size={18} />;
    return <XCircle className="text-red-500" size={18} />;
  };

  return (
    <div className="space-y-6">
      
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <LayoutDashboard className="text-brand-500" />
            Dashboard de Disparos
          </h2>
          <p className="text-zinc-400 mt-1">Visão geral e histórico das notificações enviadas</p>
        </div>
        <button onClick={carregarDados} className="btn-secondary">
          <Activity size={18} /> Atualizar
        </button>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 py-10">Carregando dados...</div>
      ) : (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="panel flex items-center gap-4">
              <div className="p-3 rounded-lg bg-zinc-800 text-zinc-300">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Total de Disparos</p>
                <h3 className="text-2xl font-bold text-zinc-100">{resumo.total}</h3>
              </div>
            </div>
            
            <div className="panel flex items-center gap-4 border-emerald-500/20">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Enviados (Sucesso)</p>
                <h3 className="text-2xl font-bold text-emerald-500">{resumo.sucessos}</h3>
              </div>
            </div>

            <div className="panel flex items-center gap-4 border-red-500/20">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Falhas / Erros</p>
                <h3 className="text-2xl font-bold text-red-500">{resumo.erros}</h3>
              </div>
            </div>
          </div>

          {/* Lista de Disparos */}
          <div className="panel p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-lg font-semibold text-zinc-200">Últimos Disparos</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300 border-collapse">
                <thead className="text-xs uppercase bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Oferta</th>
                    <th className="px-6 py-4 font-medium">Mensagem Prévia</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {disparos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">Nenhum disparo registrado ainda.</td>
                    </tr>
                  ) : (
                    disparos.map((d) => (
                      <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(d.data_disparo).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-200">{d.cliente_nome}</td>
                        <td className="px-6 py-4 text-brand-400">{d.artista}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={d.mensagem}>
                          {d.mensagem.substring(0, 40)}...
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon status={d.status} />
                            <span className={d.status === 'SUCESSO' ? 'text-emerald-500' : 'text-red-500'}>
                              {d.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
