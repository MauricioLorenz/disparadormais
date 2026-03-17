import React, { useEffect, useState } from 'react';
import { CalendarRange, Activity, MapPin, DollarSign, Clock, ChevronDown, Send } from 'lucide-react';
import api from '../services/api';

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ofertaSelecionada, setOfertaSelecionada] = useState(null);
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    carregarOfertas();
    carregarClientes();
  }, []);

  const carregarOfertas = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/ofertas');
      setOfertas(resp.data);
    } catch (error) {
      console.error('Erro ao buscar ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const resp = await api.get('/clientes');
      setClientes(resp.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const abrirModalReenvioOfertas = (ofertasGrupo) => {
    setOfertaSelecionada(ofertasGrupo); // Armazena array de ofertas
    setClientesSelecionados([]);
    setMensagem('');
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setOfertaSelecionada(null);
    setClientesSelecionados([]);
    setMensagem('');
  };

  const toggleClienteSelecionado = (clienteId) => {
    setClientesSelecionados(prev =>
      prev.includes(clienteId)
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const reenviarOferta = async () => {
    if (!ofertaSelecionada) return;
    if (clientesSelecionados.length === 0) {
      setMensagem('Selecione pelo menos um cliente');
      return;
    }

    setEnviando(true);
    setMensagem('');

    try {
      // Se é um array de ofertas (grupo), enviar todas
      const isGrupo = Array.isArray(ofertaSelecionada);
      const endpoint = isGrupo ? '/ofertas/lote/reenviar' : `/ofertas/${ofertaSelecionada.id}/reenviar`;
      const payload = isGrupo
        ? { ofertaIds: ofertaSelecionada.map(o => o.id), clienteIds: clientesSelecionados }
        : { clienteIds: clientesSelecionados };

      const resp = await api.post(endpoint, payload);

      setMensagem(`✅ ${resp.data.sucessos} disparo(s) realizado(s) com sucesso`);
      setTimeout(() => {
        fecharModal();
        carregarOfertas();
      }, 2000);
    } catch (error) {
      setMensagem(`❌ Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  // Agrupar ofertas por data de recebimento
  const agruparPorData = () => {
    const grupos = {};

    ofertas.forEach(oferta => {
      const data = new Date(oferta.data_recebimento);
      const chave = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(oferta);
    });

    // Ordenar grupos por data (mais recentes primeiro)
    return Object.entries(grupos)
      .sort((a, b) => {
        const dataA = new Date(ofertas.find(o => {
          const d = new Date(o.data_recebimento).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          return d === a[0];
        }).data_recebimento);

        const dataB = new Date(ofertas.find(o => {
          const d = new Date(o.data_recebimento).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          return d === b[0];
        }).data_recebimento);

        return dataB - dataA;
      });
  };

  const gruposOfertas = agruparPorData();

  const toggleGrupo = (data) => {
    setExpandidos(prev => ({
      ...prev,
      [data]: !prev[data]
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarRange className="text-brand-500" />
            Ofertas Recebidas
          </h2>
          <p className="text-zinc-400 mt-1">Histórico de ofertas enviadas pela Plataforma Mais Show</p>
        </div>
        <button onClick={carregarOfertas} className="btn-secondary">
          <Activity size={18} /> Atualizar View
        </button>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 py-10">Buscando ofertas...</div>
      ) : ofertas.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <CalendarRange className="text-zinc-700 mb-4" size={48} />
          <h3 className="text-xl font-medium text-zinc-300">Nenhuma oferta registrada</h3>
          <p className="text-zinc-500 mt-2 max-w-sm">
            O sistema ainda não recebeu dados via Webhook da plataforma matriz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gruposOfertas.map(([data, ofertasGrupo]) => (
            <div key={data} className="border border-zinc-800 rounded-lg overflow-hidden">
              {/* Cabeçalho acordeom */}
              <div className="w-full px-6 py-4 bg-zinc-900/50 hover:bg-zinc-900 transition-colors flex items-center justify-between group">
                <button
                  onClick={() => toggleGrupo(data)}
                  className="flex-1 flex items-center gap-4"
                >
                  <Clock className="text-brand-500" size={20} />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-brand-400 transition-colors">
                      {data}
                    </h3>
                  </div>
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">
                    {ofertasGrupo.length} {ofertasGrupo.length === 1 ? 'oferta' : 'ofertas'}
                  </span>
                  <button
                    onClick={() => abrirModalReenvioOfertas(ofertasGrupo)}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                    title="Reenviar todas as ofertas deste período"
                  >
                    <Send size={13} /> Enviar Tudo
                  </button>
                  <ChevronDown
                    size={20}
                    className={`text-zinc-400 transition-transform duration-300 cursor-pointer ${
                      expandidos[data] ? 'rotate-180' : ''
                    }`}
                    onClick={() => toggleGrupo(data)}
                  />
                </div>
              </div>

              {/* Conteúdo acordeom */}
              {expandidos[data] && (
                <div className="p-6 bg-zinc-900/30 border-t border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ofertasGrupo.map((of) => (
                      <div key={of.id} className="panel hover:border-brand-500/50 transition-colors group relative overflow-hidden flex flex-col">

                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-zinc-100 group-hover:text-brand-400 transition-colors line-clamp-1" title={of.artista}>
                            {of.artista}
                          </h4>
                          <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                            ID: {of.id}
                          </span>
                        </div>

                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <Clock className="text-zinc-500 shrink-0" size={16} />
                            <span className="truncate">{of.data}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <MapPin className="text-zinc-500 shrink-0" size={16} />
                            <span className="truncate">{of.estados}</span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <DollarSign className="text-emerald-500 shrink-0" size={16} />
                            <span className="font-semibold text-emerald-400">
                              R$ {Number(of.cache_medio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between">
                          <span>Hora:</span>
                          <span>{new Date(of.data_recebimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Reenvio */}
      {isModalOpen && ofertaSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Send className="text-brand-500" size={20} />
              {Array.isArray(ofertaSelecionada) ? 'Reenviar Lote de Ofertas' : 'Reenviar Oferta'}
            </h3>

            {/* Resumo de ofertas */}
            <div className="mb-4 space-y-2 max-h-40 overflow-y-auto border border-zinc-800 rounded-lg p-3 bg-zinc-950">
              {Array.isArray(ofertaSelecionada) ? (
                ofertaSelecionada.map(of => (
                  <div key={of.id} className="p-2 bg-zinc-800/50 rounded border border-zinc-700">
                    <p className="text-sm text-zinc-300"><span className="font-semibold">{of.artista}</span></p>
                    <p className="text-xs text-zinc-500">R$ {Number(of.cache_medio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))
              ) : (
                <div className="p-2 bg-zinc-800/50 rounded border border-zinc-700">
                  <p className="text-sm text-zinc-300"><span className="font-semibold">{ofertaSelecionada.artista}</span></p>
                  <p className="text-xs text-zinc-500">R$ {Number(ofertaSelecionada.cache_medio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>

            <label className="label-field mb-3">Selecione os clientes para notificar:</label>

            <div className="space-y-2 mb-5 max-h-60 overflow-y-auto border border-zinc-800 rounded-lg p-3 bg-zinc-950">
              {clientes.length === 0 ? (
                <p className="text-zinc-500 text-sm">Nenhum cliente cadastrado</p>
              ) : (
                clientes.map(cliente => (
                  <label key={cliente.id} className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clientesSelecionados.includes(cliente.id)}
                      onChange={() => toggleClienteSelecionado(cliente.id)}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100 truncate">{cliente.nome}</p>
                      <p className="text-xs text-zinc-500">{cliente.telefone}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {mensagem && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                mensagem.startsWith('✅')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {mensagem}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={fecharModal}
                disabled={enviando}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={reenviarOferta}
                disabled={enviando || clientesSelecionados.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
                {enviando ? 'Enviando...' : 'Reenviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
