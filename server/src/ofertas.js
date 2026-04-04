import express from 'express';
import db from './db.js';
import axios from 'axios';

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatarCache(cacheMedio) {
  const valor = Number(cacheMedio);
  if (valor > 500000) return '$$$$$  - Acima de 500 mil reais';
  if (valor > 250000) return '$$$$ - 250 a 500 mil reais';
  if (valor > 100000) return '$$$ - 100 a 250 mil reais';
  if (valor > 50000)  return '$$ - 50 a 100 mil reais';
  return '$ - 10 a 50 mil reais';
}

function formatarData(data) {
  if (data && data.includes('-')) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return data;
}

function montarMensagem(templateTexto, cliente, ofertasDoCliente) {
  const extrair = (tag) => {
    const re = new RegExp(`\\{\\{#${tag}\\}\\}([\\s\\S]*?)\\{\\{/${tag}\\}\\}`, '');
    const m = templateTexto.match(re);
    return m ? m[1] : '';
  };

  const secaoTopo   = extrair('topo').trim();
  const secaoOferta = extrair('oferta').replace(/^\n/, '').replace(/\n$/, '');
  const secaoRodape = extrair('rodape').trim();

  let topo = secaoTopo;
  topo = topo.replace(/{{nome}}/g, cliente.nome);
  topo = topo.replace(/{{quantidadeOfertas}}/g, ofertasDoCliente.length);

  let listaOfertas = '';
  for (const oferta of ofertasDoCliente) {
    const estados = oferta.estados.replace(/"/g, '').trim();
    let linha = secaoOferta;
    linha = linha.replace(/{{nome_artista}}/g, oferta.artista);
    linha = linha.replace(/{{data}}/g,         formatarData(oferta.data));
    linha = linha.replace(/{{estados}}/g,      estados);
    linha = linha.replace(/{{media_cache}}/g,  formatarCache(oferta.cache_medio));
    listaOfertas += linha;
  }

  return `${topo}\n\n${listaOfertas}\n${secaoRodape}`;
}

// Envio via Evolution API — retorna { ok, motivo }
async function enviarWhatsApp(telefone, mensagem) {
  const evoUrl      = process.env.EVO_API_URL;
  const evoInstance = process.env.EVO_INSTANCE_NAME;
  const evoToken    = process.env.EVO_API_TOKEN;

  if (!evoUrl || !evoInstance || !evoToken) {
    console.warn('Credenciais da Evolution API não configuradas (EVO_API_URL, EVO_INSTANCE_NAME, EVO_API_TOKEN).');
    return { ok: false, motivo: 'EVO_NAO_CONFIGURADO' };
  }

  try {
    let numFormatado = telefone.replace(/\D/g, '');
    if (numFormatado.length === 10 || numFormatado.length === 11) numFormatado = `55${numFormatado}`;

    const response = await axios.post(
      `${evoUrl}/message/sendText/${evoInstance}`,
      { number: numFormatado, text: mensagem },
      { headers: { 'Content-Type': 'application/json', 'apikey': evoToken } }
    );
    const ok = response.status === 200 || response.status === 201;
    return { ok, motivo: ok ? null : 'API_STATUS_INESPERADO' };
  } catch (error) {
    const detalhe = error?.response?.data || error.message;
    console.error('Erro na Evolution API:', detalhe);
    return { ok: false, motivo: 'FALHA_API', detalhe };
  }
}

// ─── Rotas ──────────────────────────────────────────────────────────────────

// Listar todas as ofertas recebidas
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.execute('SELECT * FROM ofertas ORDER BY data_recebimento DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint principal (Webhook) para receber a Oferta da Plataforma Mais Show
router.post('/', async (req, res) => {
  const { artista, data, estados, cache_medio } = req.body;

  if (!artista || !data || !estados || cache_medio === undefined) {
    return res.status(400).json({ error: 'Payload incompleto (artista, data, estados, cache_medio).' });
  }

  try {
    const result = await db.execute({
      sql: 'INSERT INTO ofertas (artista, data, estados, cache_medio) VALUES (?, ?, ?, ?)',
      args: [artista, data, estados, cache_medio],
    });
    const ofertaId = Number(result.lastInsertRowid);

    console.log(`Nova Oferta Recebida: ${artista} - ${data}`);
    processarMatchDeOferta(ofertaId, req.body).catch(console.error);

    return res.status(200).json({ success: true, message: 'Oferta recebida e processando matches.', oferta_id: ofertaId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Lógica de Match: disparo automático ao receber nova oferta
async function processarMatchDeOferta(ofertaId, ofertaData) {
  const { artista, data, estados, cache_medio } = ofertaData;
  const estadosOferta = estados.split(',').map(e => e.trim().toUpperCase());

  const { rows: clientes } = await db.execute('SELECT * FROM clientes WHERE ativo = 1');

  let templateDb = null;
  const { rows: tpl1 } = await db.execute('SELECT * FROM templates WHERE padrao = 1 LIMIT 1');
  if (tpl1.length > 0) {
    templateDb = tpl1[0];
  } else {
    const { rows: tpl2 } = await db.execute('SELECT * FROM templates LIMIT 1');
    templateDb = tpl2[0] || null;
  }

  if (!templateDb) {
    console.error('Nenhum template de mensagem configurado.');
    return;
  }

  for (const cliente of clientes) {
    const cacheMatch = cliente.cache_min <= cache_medio && cliente.cache_max >= cache_medio;
    const estadosCliente = cliente.estados_interesse.split(',').map(e => e.trim().toUpperCase());
    const estadosMatch = estadosCliente.some(ec => estadosOferta.includes(ec));

    if (!cacheMatch || !estadosMatch) {
      console.log(`Cliente ${cliente.nome} sem match (cache: ${cacheMatch}, estados: ${estadosMatch})`);
      continue;
    }

    const ofertaObj = { artista, data, estados, cache_medio };
    const mensagem = montarMensagem(templateDb.texto, cliente, [ofertaObj]);

    try {
      const { ok, motivo } = await enviarWhatsApp(cliente.telefone, mensagem);
      const status = ok ? 'SUCESSO' : `ERRO - ${motivo}`;
      await db.execute({
        sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
        args: [ofertaId, cliente.id, mensagem, status],
      });
      console.log(`Disparo para ${cliente.nome}: ${status}`);
    } catch (err) {
      console.error(`Erro ao disparar para cliente ID ${cliente.id}:`, err);
      await db.execute({
        sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
        args: [ofertaId, cliente.id, '', 'ERRO - FALHA NA API'],
      });
    }
  }
}

// Reenvio em lote de ofertas manualmente
router.post('/lote/reenviar', async (req, res) => {
  const { ofertaIds, clienteIds } = req.body;

  if (!Array.isArray(ofertaIds) || ofertaIds.length === 0)
    return res.status(400).json({ error: 'Forneça uma lista de ofertas' });

  if (!Array.isArray(clienteIds) || clienteIds.length === 0)
    return res.status(400).json({ error: 'Selecione pelo menos um cliente' });

  try {
    const placeholderOfertas = ofertaIds.map(() => '?').join(',');
    const { rows: ofertas } = await db.execute({
      sql: `SELECT * FROM ofertas WHERE id IN (${placeholderOfertas})`,
      args: ofertaIds,
    });

    if (ofertas.length === 0)
      return res.status(404).json({ error: 'Nenhuma oferta encontrada' });

    const placeholderClientes = clienteIds.map(() => '?').join(',');
    const { rows: clientes } = await db.execute({
      sql: `SELECT * FROM clientes WHERE id IN (${placeholderClientes}) AND ativo = 1`,
      args: clienteIds,
    });

    if (clientes.length === 0)
      return res.status(400).json({ error: 'Nenhum cliente ativo selecionado' });

    let templateDb = null;
    const { rows: tpl1 } = await db.execute('SELECT * FROM templates WHERE padrao = 1 LIMIT 1');
    if (tpl1.length > 0) {
      templateDb = tpl1[0];
    } else {
      const { rows: tpl2 } = await db.execute('SELECT * FROM templates LIMIT 1');
      templateDb = tpl2[0] || null;
    }

    if (!templateDb)
      return res.status(400).json({ error: 'Nenhum template configurado' });

    let sucessos = 0;
    let erros = 0;
    let semMatch = 0;
    let motivoErro = null;
    const resultados = [];

    for (const cliente of clientes) {
      const ofertasDoCliente = ofertas.filter(oferta => {
        const estadosOferta = oferta.estados.split(',').map(e => e.trim().toUpperCase());
        const estadosCliente = cliente.estados_interesse.split(',').map(e => e.trim().toUpperCase());
        const cacheMatch = cliente.cache_min <= oferta.cache_medio && cliente.cache_max >= oferta.cache_medio;
        const estadosMatch = estadosCliente.some(ec => estadosOferta.includes(ec));
        return cacheMatch && estadosMatch;
      });

      if (ofertasDoCliente.length === 0) {
        semMatch++;
        resultados.push({ cliente: cliente.nome, status: 'SEM_MATCH', detalhe: `cache: ${cliente.cache_min}-${cliente.cache_max}, estados: ${cliente.estados_interesse}` });
        continue;
      }

      const mensagem = montarMensagem(templateDb.texto, cliente, ofertasDoCliente);

      try {
        const { ok, motivo, detalhe } = await enviarWhatsApp(cliente.telefone, mensagem);
        const status = ok ? 'SUCESSO' : `ERRO - ${motivo}`;
        if (!ok && motivo) motivoErro = motivo === 'EVO_NAO_CONFIGURADO'
          ? 'Evolution API não configurada no servidor (variáveis EVO_API_URL, EVO_INSTANCE_NAME, EVO_API_TOKEN ausentes)'
          : (detalhe ? JSON.stringify(detalhe) : motivo);

        for (const oferta of ofertasDoCliente) {
          await db.execute({
            sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
            args: [oferta.id, cliente.id, mensagem, status],
          });

          if (ok) {
            sucessos++;
            resultados.push({ oferta_id: oferta.id, artista: oferta.artista, cliente: cliente.nome, status: 'SUCESSO' });
          } else {
            erros++;
            resultados.push({ oferta_id: oferta.id, artista: oferta.artista, cliente: cliente.nome, status, detalhe: motivoErro });
          }
        }
      } catch (err) {
        console.error(`Erro ao enviar para ${cliente.nome}:`, err);
        for (const oferta of ofertasDoCliente) {
          await db.execute({
            sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
            args: [oferta.id, cliente.id, mensagem, 'ERRO - FALHA NA API'],
          });
          erros++;
          resultados.push({ oferta_id: oferta.id, artista: oferta.artista, cliente: cliente.nome, status: 'ERRO - FALHA NA API' });
        }
      }
    }

    res.json({
      message: `Reenvio concluído. ${sucessos} enviado(s), ${erros} erro(s), ${semMatch} sem match.`,
      sucessos,
      erros,
      semMatch,
      motivoErro,
      total: sucessos + erros,
      resultados,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reenvio de oferta individual manualmente
router.post('/:ofertaId/reenviar', async (req, res) => {
  const { ofertaId } = req.params;
  const { clienteIds } = req.body;

  try {
    const { rows: ofertaRows } = await db.execute({ sql: 'SELECT * FROM ofertas WHERE id = ?', args: [ofertaId] });
    if (ofertaRows.length === 0) return res.status(404).json({ error: 'Oferta não encontrada' });
    const oferta = ofertaRows[0];

    const estadosOferta = oferta.estados.split(',').map(e => e.trim().toUpperCase());

    let clientes;
    if (clienteIds === 'todos') {
      const { rows } = await db.execute('SELECT * FROM clientes WHERE ativo = 1');
      clientes = rows;
    } else if (Array.isArray(clienteIds) && clienteIds.length > 0) {
      const placeholders = clienteIds.map(() => '?').join(',');
      const { rows } = await db.execute({
        sql: `SELECT * FROM clientes WHERE id IN (${placeholders}) AND ativo = 1`,
        args: clienteIds,
      });
      clientes = rows;
    } else {
      return res.status(400).json({ error: 'Selecione pelo menos um cliente' });
    }

    let templateDb = null;
    const { rows: tpl1 } = await db.execute('SELECT * FROM templates WHERE padrao = 1 LIMIT 1');
    if (tpl1.length > 0) {
      templateDb = tpl1[0];
    } else {
      const { rows: tpl2 } = await db.execute('SELECT * FROM templates LIMIT 1');
      templateDb = tpl2[0] || null;
    }

    if (!templateDb) return res.status(400).json({ error: 'Nenhum template configurado' });

    let sucessos = 0;
    let erros = 0;
    let semMatch = 0;
    let motivoErro = null;
    const resultados = [];

    for (const cliente of clientes) {
      const cacheMatch = cliente.cache_min <= oferta.cache_medio && cliente.cache_max >= oferta.cache_medio;
      const estadosCliente = cliente.estados_interesse.split(',').map(e => e.trim().toUpperCase());
      const estadosMatch = estadosCliente.some(ec => estadosOferta.includes(ec));

      if (!cacheMatch || !estadosMatch) {
        semMatch++;
        resultados.push({ cliente: cliente.nome, status: 'SEM_MATCH', detalhe: `cache: ${cliente.cache_min}-${cliente.cache_max}, estados: ${cliente.estados_interesse}` });
        continue;
      }

      const mensagem = montarMensagem(templateDb.texto, cliente, [oferta]);

      try {
        const { ok, motivo, detalhe } = await enviarWhatsApp(cliente.telefone, mensagem);
        const status = ok ? 'SUCESSO' : `ERRO - ${motivo}`;
        if (!ok && motivo) motivoErro = motivo === 'EVO_NAO_CONFIGURADO'
          ? 'Evolution API não configurada no servidor (variáveis EVO_API_URL, EVO_INSTANCE_NAME, EVO_API_TOKEN ausentes)'
          : (detalhe ? JSON.stringify(detalhe) : motivo);

        await db.execute({
          sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
          args: [ofertaId, cliente.id, mensagem, status],
        });

        if (ok) { sucessos++; resultados.push({ cliente: cliente.nome, status: 'SUCESSO' }); }
        else     { erros++;    resultados.push({ cliente: cliente.nome, status, detalhe: motivoErro }); }
      } catch (err) {
        console.error(`Erro ao enviar para ${cliente.nome}:`, err);
        await db.execute({
          sql: 'INSERT INTO disparos (oferta_id, cliente_id, mensagem, status) VALUES (?, ?, ?, ?)',
          args: [ofertaId, cliente.id, '', 'ERRO - FALHA NA API'],
        });
        erros++;
        resultados.push({ cliente: cliente.nome, status: 'ERRO - FALHA NA API' });
      }
    }

    res.json({
      message: `Reenvio concluído. ${sucessos} enviado(s), ${erros} erro(s), ${semMatch} sem match.`,
      sucessos,
      erros,
      semMatch,
      motivoErro,
      resultados,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
