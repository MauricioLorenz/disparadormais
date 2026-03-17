import React, { useEffect, useState } from 'react';
import { Send, CheckCircle, AlertCircle, Clock, User, Music, ChevronDown } from 'lucide-react';
import api from '../services/api';

export default function Disparos() {
  const [disparos, setDisparos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    carregarDisparos();
  }, []);

  const carregarDisparos = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/disparos');
      setDisparos(resp.data);
    } catch (error) {
      console.error('Erro ao buscar disparos:', error);
    } finally {
      setLoading(false);
    }
  };

  const disparosFiltrados = disparos.filter(d => {
    if (filtroStatus === 'todos') return true;
    return d.status === filtroStatus;
  });

  // Agrupar disparos por data
  const agruparPorData = () => {
    const grupos = {};

    disparosFiltrados.forEach(disparo => {
      const data = new Date(disparo.data_disparo);
      const chave = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(disparo);
    });

    // Ordenar grupos por data (mais recentes primeiro)
    return Object.entries(grupos).sort((a, b) => {
      const dataA = new Date(disparosFiltrados.find(d => {
        const dt = new Date(d.data_disparo).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return dt === a[0];
      }).data_disparo);

      const dataB = new Date(disparosFiltrados.find(d => {
        const dt = new Date(d.data_disparo).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return dt === b[0];
      }).data_disparo);

      return dataB - dataA;
    });
  };

  const gruposDisparos = agruparPorData();

  const toggleGrupo = (data) => {
    setExpandidos(prev => ({
      ...prev,
      [data]: !prev[data]
    }));
  };

  const contagemStatus = {
    SUCESSO: disparos.filter(d => d.status === 'SUCESSO').length,
    ERRO: disparos.filter(d => d.status === 'ERRO').length,
    SIMULADO: disparos.filter(d => d.status === 'SIMULADO').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCESSO':
        return <CheckCircle className="text-emerald-500" size={18} />;
      case 'ERRO':
        return <AlertCircle className="text-red-500" size={18} />;
      case 'SIMULADO':
        return <Clock className="text-yellow-500" size={18} />;
      default:
        return <Send className="text-zinc-500" size={18} />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'SUCESSO':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ERRO':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'SIMULADO':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Send className="text-brand-500" />
            Disparos Realizados
          </h2>
          <p className="text-zinc-400 mt-1">Histórico de notificações enviadas aos clientes</p>
        </div>
        <button onClick={carregarDisparos} className="btn-secondary">
          <Clock size={18} /> Atualizar
        </button>
      </header>

      {/* Filtros e Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="panel">
          <div className="text-sm text-zinc-500 mb-1">Total de Disparos</div>
          <div className="text-3xl font-bold text-zinc-100">{disparos.length}</div>
        </div>
        <div className="panel bg-emerald-500/10 border-emerald-500/30">
          <div className="text-sm text-emerald-400 mb-1">✅ Sucesso</div>
          <div className="text-3xl font-bold text-emerald-400">{contagemStatus.SUCESSO}</div>
        </div>
        <div className="panel bg-yellow-500/10 border-yellow-500/30">
          <div className="text-sm text-yellow-400 mb-1">⏱️ Simulado</div>
          <div className="text-3xl font-bold text-yellow-400">{contagemStatus.SIMULADO}</div>
        </div>
        <div className="panel bg-red-500/10 border-red-500/30">
          <div className="text-sm text-red-400 mb-1">❌ Erro</div>
          <div className="text-3xl font-bold text-red-400">{contagemStatus.ERRO}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos', 'SUCESSO', 'SIMULADO', 'ERRO'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroStatus === status
                ? 'bg-brand-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {status === 'todos' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-zinc-500 py-10">Buscando disparos...</div>
      ) : disparosFiltrados.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <Send className="text-zinc-700 mb-4" size={48} />
          <h3 className="text-xl font-medium text-zinc-300">Nenhum disparo registrado</h3>
          <p className="text-zinc-500 mt-2">
            Os disparos aparecerão aqui quando ofertas forem match com clientes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gruposDisparos.map(([data, disparosGrupo]) => (
            <div key={data} className="border border-zinc-800 rounded-lg overflow-hidden">
              {/* Cabeçalho acordeom */}
              <button
                onClick={() => toggleGrupo(data)}
                className="w-full px-6 py-4 bg-zinc-900/50 hover:bg-zinc-900 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <Clock className="text-brand-500" size={20} />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-brand-400 transition-colors">
                      {data}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">
                    {disparosGrupo.length} {disparosGrupo.length === 1 ? 'disparo' : 'disparos'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-zinc-400 transition-transform duration-300 ${
                      expandidos[data] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Conteúdo acordeom */}
              {expandidos[data] && (
                <div className="p-6 bg-zinc-900/30 border-t border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                      <thead className="bg-zinc-800/50 text-zinc-400 border-b border-zinc-800 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Artista</th>
                          <th className="px-4 py-3">Cache</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {disparosGrupo.map((disparo) => (
                          <tr key={disparo.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-zinc-400">#{disparo.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-zinc-500" />
                                <span className="font-medium text-zinc-100">{disparo.cliente_nome || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Music size={14} className="text-zinc-500" />
                                <span>{disparo.artista_nome || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-emerald-400">
                              R$ {Number(disparo.cache_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(disparo.status)}`}>
                                {getStatusIcon(disparo.status)}
                                {disparo.status}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-zinc-500 text-xs">
                              {disparo.data_disparo ? new Date(disparo.data_disparo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resumo por Cliente */}
      {disparos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Resumo por Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(disparos.map(d => d.cliente_nome))).map(cliente => {
              const clienteDisparos = disparos.filter(d => d.cliente_nome === cliente);
              return (
                <div key={cliente} className="panel">
                  <h4 className="font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                    <User size={16} className="text-brand-500" />
                    {cliente}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-zinc-400">
                      Total de disparos: <span className="text-brand-400 font-bold">{clienteDisparos.length}</span>
                    </div>
                    <div className="text-zinc-400">
                      Status sucesso: <span className="text-emerald-400 font-bold">{clienteDisparos.filter(d => d.status === 'SUCESSO').length}</span>
                    </div>
                    <div className="text-zinc-400 mt-3 flex flex-wrap gap-1">
                      {clienteDisparos.map(d => (
                        <span key={d.id} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs">
                          {d.artista_nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
