import React, { useEffect, useState } from 'react';
import { MessageSquareText, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, nome: '', texto: '', padrao: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    carregarTemplates();
  }, []);

  const carregarTemplates = async () => {
    try {
      const resp = await api.get('/templates');
      setTemplates(resp.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const salvarTemplate = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/templates/${formData.id}`, formData);
      } else {
        await api.post('/templates', formData);
      }
      setIsModalOpen(false);
      carregarTemplates();
    } catch (error) {
      const errObj = error.response?.data?.error;
      const errMsg = errObj?.message || (typeof errObj === 'string' ? errObj : JSON.stringify(errObj)) || error.message;
      alert('Erro ao salvar template: ' + errMsg);
    }
  };

  const deletarTemplate = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) return;
    try {
      await api.delete(`/templates/${id}`);
      carregarTemplates();
    } catch (error) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const abrirModal = (template = null) => {
    if (template) {
      setFormData({ ...template, padrao: Boolean(template.padrao) });
    } else {
      setFormData({ id: null, nome: '', texto: '', padrao: false });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageSquareText className="text-brand-500" />
            Templates de Mensagens
          </h2>
          <p className="text-zinc-400 mt-1">Gerencie os modelos de mensagens disparados via WhatsApp</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus size={18} /> Novo Template
        </button>
      </header>

      {loading ? (
        <div className="text-zinc-500">Carregando templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className={`panel flex flex-col relative overflow-hidden transition-colors ${tpl.padrao ? 'border-brand-500 shadow-brand-500/10 shadow-lg' : 'hover:border-zinc-700'}`}>
              
              {tpl.padrao && (
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                  <CheckCircle2 size={12} /> Padrão Ativo
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-zinc-100 pr-20">{tpl.nome}</h3>
              </div>

              <div className="flex-1 bg-zinc-950 rounded-lg p-4 mb-4 border border-zinc-800 font-mono text-sm text-zinc-300 whitespace-pre-wrap overflow-y-auto max-h-40">
                {tpl.texto}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-800">
                <button onClick={() => abrirModal(tpl)} className="btn-secondary text-xs flex-1 py-1.5">
                  <Edit2 size={14} /> Editar
                </button>
                <button 
                  onClick={() => deletarTemplate(tpl.id)} 
                  className="btn-secondary text-xs flex-1 py-1.5 !bg-red-500/10 !text-red-500 hover:!bg-red-500 hover:!text-white border border-red-500/20"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Simples */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-100 mb-6">{formData.id ? 'Editar Template' : 'Novo Template'}</h3>
            
            <form onSubmit={salvarTemplate} className="space-y-4">
              <div>
                <label className="label-field">Nome Identificador</label>
                <input 
                  type="text" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="input-field" 
                  required 
                  placeholder="Ex: Oferta Padrão" 
                />
              </div>

              <div>
                <label className="label-field flex justify-between">
                  Corpo da Mensagem
                  <span className="text-xs text-brand-400 font-normal">Variáveis dinâmicas:</span>
                </label>
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 mb-3 text-xs text-zinc-400 space-y-1">
                  <div className="font-semibold text-brand-400 mb-2">Estrutura do template (3 seções):</div>
                  <div><span className="text-brand-400 font-semibold">{'{{#topo}}'}</span> ... <span className="text-brand-400 font-semibold">{'{{/topo}}'}</span> — cabeçalho (aparece 1x)</div>
                  <div className="pl-3 text-zinc-500">{'{{nome}}'} — nome do cliente &nbsp;|&nbsp; {'{{quantidadeOfertas}}'} — total de ofertas</div>
                  <div><span className="text-brand-400 font-semibold">{'{{#oferta}}'}</span> ... <span className="text-brand-400 font-semibold">{'{{/oferta}}'}</span> — repetido para cada oferta</div>
                  <div className="pl-3 text-zinc-500">{'{{nome_artista}}'} &nbsp;|&nbsp; {'{{data}}'} &nbsp;|&nbsp; {'{{estados}}'} &nbsp;|&nbsp; {'{{media_cache}}'}</div>
                  <div><span className="text-brand-400 font-semibold">{'{{#rodape}}'}</span> ... <span className="text-brand-400 font-semibold">{'{{/rodape}}'}</span> — rodapé (aparece 1x)</div>
                </div>
                <textarea
                  value={formData.texto}
                  onChange={e => setFormData({...formData, texto: e.target.value})}
                  className="input-field min-h-[220px] font-mono text-sm resize-y"
                  required
                  placeholder={"{{#topo}}\nOlá {{nome}}, \n\nTemos {{quantidadeOfertas}} oferta(s)!\n{{/topo}}\n{{#oferta}}\n🎙️ {{nome_artista}}\n🗓️ Data: {{data}}\n📍 {{estados}}\n💰 {{media_cache}}\n\n{{/oferta}}\n{{#rodape}}\nTem interesse? Acesse o painel.\n{{/rodape}}"}
                />
              </div>

              <div className="flex items-center gap-3 py-2 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                <input 
                  type="checkbox" 
                  id="padrao"
                  checked={formData.padrao}
                  onChange={e => setFormData({...formData, padrao: e.target.checked})}
                  className="w-5 h-5 accent-brand-500 bg-zinc-800 border-zinc-700 rounded cursor-pointer"
                />
                <label htmlFor="padrao" className="text-sm font-medium text-zinc-300 cursor-pointer">
                  Definir como template padrão de envio
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
