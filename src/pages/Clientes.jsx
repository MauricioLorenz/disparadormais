import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Trash2, MapPin, Phone, DollarSign } from 'lucide-react';
import api from '../services/api';

// Faixas de cachê conforme solicitado
const CACHE_TIERS = [
  { value: '$',     label: '$',     desc: 'R$ 10k a 50k'     },
  { value: '$$',    label: '$$',    desc: 'R$ 50k a 100k'    },
  { value: '$$$',   label: '$$$',   desc: 'R$ 100k a 250k'   },
  { value: '$$$$',  label: '$$$$',  desc: 'R$ 250k a 500k'   },
  { value: '$$$$$', label: '$$$$$', desc: 'Acima de R$ 500k' },
];

// Todos os estados brasileiros
const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const FORM_INICIAL = {
  id: null,
  nome: '',
  telefone: '',
  estados_interesse: [],
  cache_tier: [],
  ativo: true,
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_INICIAL);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarClientes(); }, []);

  const carregarClientes = async () => {
    try {
      const resp = await api.get('/clientes');
      setClientes(resp.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleEstado = (sigla) => {
    setForm(prev => {
      const atual = Array.isArray(prev.estados_interesse) ? prev.estados_interesse : [];
      return {
        ...prev,
        estados_interesse: atual.includes(sigla)
          ? atual.filter(e => e !== sigla)
          : [...atual, sigla],
      };
    });
  };

  const salvarCliente = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.cache_tier.length) return setErro('Selecione pelo menos uma faixa de cachê.');
    if (!form.estados_interesse.length) return setErro('Selecione pelo menos um estado.');

    const payload = {
      ...form,
      cache_tier: Array.isArray(form.cache_tier)
        ? form.cache_tier
        : form.cache_tier.split(',').map(t => t.trim()),
      estados_interesse: Array.isArray(form.estados_interesse)
        ? form.estados_interesse.join(', ')
        : form.estados_interesse,
    };

    try {
      if (form.id) {
        await api.put(`/clientes/${form.id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      setIsModalOpen(false);
      carregarClientes();
    } catch (error) {
      setErro(error.response?.data?.error || error.message);
    }
  };

  const deletarCliente = async (id) => {
    if (!window.confirm('Deseja excluir este cliente?')) return;
    try { await api.delete(`/clientes/${id}`); carregarClientes(); }
    catch (err) { alert(err.message); }
  };

  const abrirModal = (cliente = null) => {
    setErro('');
    if (cliente) {
      const estados = typeof cliente.estados_interesse === 'string'
        ? cliente.estados_interesse.split(',').map(e => e.trim())
        : cliente.estados_interesse || [];
      const tiers = typeof cliente.cache_tier === 'string'
        ? cliente.cache_tier.split(',').map(t => t.trim())
        : cliente.cache_tier || [];
      setForm({ ...cliente, estados_interesse: estados, cache_tier: tiers, ativo: Boolean(cliente.ativo) });
    } else {
      setForm(FORM_INICIAL);
    }
    setIsModalOpen(true);
  };

  const tierBadgeColor = (tier) => {
    const c = {
      '$': 'bg-zinc-800 text-zinc-300',
      '$$': 'bg-blue-500/10 text-blue-400',
      '$$$': 'bg-emerald-500/10 text-emerald-400',
      '$$$$': 'bg-orange-500/10 text-orange-400',
      '$$$$$': 'bg-brand-500/10 text-brand-400',
    };
    return c[tier] || 'bg-zinc-800 text-zinc-300';
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="text-brand-500" />
            Clientes e Perfis
          </h2>
          <p className="text-zinc-400 mt-1">Cadastre os compradores com seus critérios de interesse</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus size={18} /> Novo Cliente
        </button>
      </header>

      {loading ? (
        <div className="text-zinc-500">Carregando...</div>
      ) : clientes.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <Users className="text-zinc-700 mb-4" size={48} />
          <h3 className="text-xl font-medium text-zinc-300">Nenhum cliente cadastrado</h3>
          <p className="text-zinc-500 mt-2">Adicione clientes para começar a receber notificações de ofertas.</p>
        </div>
      ) : (
        <div className="panel p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-800/50 text-zinc-400 border-b border-zinc-800 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Estados</th>
                  <th className="px-6 py-4">Faixa de Cachê</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-100">{c.nome}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Phone size={14} className="text-zinc-500" /> {c.telefone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.estados_interesse.split(',').map(e => (
                          <span key={e} className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-mono">
                            {e.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.cache_tier.split(',').map(t => (
                          <span key={t} className={`px-3 py-1 rounded-full text-xs font-bold ${tierBadgeColor(t.trim())}`}>
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.ativo ? (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium">Ativo</span>
                      ) : (
                        <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-medium">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => abrirModal(c)} className="p-2 text-zinc-400 hover:text-brand-500 transition-colors rounded-lg hover:bg-zinc-800">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deletarCliente(c.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
              <Users className="text-brand-500" size={20} />
              {form.id ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>

            <form onSubmit={salvarCliente} className="space-y-5">
              
              {/* Nome */}
              <div>
                <label className="label-field">Nome Completo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: João Silva"
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="label-field flex items-center gap-1">
                  <Phone size={13} /> Contato do WhatsApp
                </label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="Ex: 5548999999999 (com DDI e DDD)"
                  required
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value.replace(/\D/g, '') })}
                />
                <p className="text-xs text-zinc-500 mt-1">Somente números, incluindo DDI 55. Ex: <span className="font-mono">5548999999999</span></p>
              </div>

              {/* Faixa de Cachê */}
              <div>
                <label className="label-field flex items-center gap-1">
                  <DollarSign size={13} /> Faixas de Cachê de Interesse
                </label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {CACHE_TIERS.map((t) => {
                    const selecionado = Array.isArray(form.cache_tier) && form.cache_tier.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => {
                          const atual = Array.isArray(form.cache_tier) ? form.cache_tier : [];
                          const novo = atual.includes(t.value)
                            ? atual.filter(x => x !== t.value)
                            : [...atual, t.value];
                          setForm({ ...form, cache_tier: novo });
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200 ${
                          selecionado
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        <span className="font-bold text-sm">{t.label}</span>
                        <span className="text-[9px] mt-1 leading-tight text-center opacity-70">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {Array.isArray(form.cache_tier) && form.cache_tier.length > 0 && (
                  <p className="text-xs text-brand-400 mt-2">
                    Selecionadas: {form.cache_tier.join(', ')}
                  </p>
                )}
              </div>

              {/* Estados de Interesse */}
              <div>
                <label className="label-field flex items-center gap-1">
                  <MapPin size={13} /> Estados de Atuação
                </label>
                <div className="grid grid-cols-9 gap-1.5 mt-1">
                  {ESTADOS_BR.map((uf) => {
                    const selecionado = Array.isArray(form.estados_interesse) && form.estados_interesse.includes(uf);
                    return (
                      <button
                        key={uf}
                        type="button"
                        onClick={() => toggleEstado(uf)}
                        className={`py-1.5 rounded text-xs font-mono font-bold transition-all duration-150 ${
                          selecionado
                            ? 'bg-brand-600 text-white border border-brand-500'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {uf}
                      </button>
                    );
                  })}
                </div>
                {Array.isArray(form.estados_interesse) && form.estados_interesse.length > 0 && (
                  <p className="text-xs text-brand-400 mt-2">
                    Selecionados: {form.estados_interesse.join(', ')}
                  </p>
                )}
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="w-5 h-5 accent-brand-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-zinc-300 cursor-pointer">
                  Cliente Ativo (recebe notificações no Match)
                </label>
              </div>

              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {erro}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
