import axios from 'axios';
import db from './db.js';

const API_BASE = 'http://localhost:3001/api';

// Clientes de teste com múltiplas faixas de cachê
const CLIENTES_TESTE = [
  {
    nome: 'João Silva - Alto Cachê',
    telefone: '5548999999999',
    estados_interesse: 'SP, RJ, MG',
    cache_tier: ['$$$$', '$$$$$'],
    ativo: true,
  },
  {
    nome: 'Maria Santos - Médio/Alto',
    telefone: '5511988888888',
    estados_interesse: 'SP, SC, RS',
    cache_tier: ['$$$', '$$$$'],
    ativo: true,
  },
  {
    nome: 'Pedro Oliveira - Baixo/Médio',
    telefone: '5585987654321',
    estados_interesse: 'BA, CE, RN',
    cache_tier: ['$', '$$', '$$$'],
    ativo: true,
  },
  {
    nome: 'Ana Costa - Apenas Baixo',
    telefone: '5512981234567',
    estados_interesse: 'MG, SP, RJ',
    cache_tier: ['$'],
    ativo: true,
  },
  {
    nome: 'Carlos Ferreira - Todos os Cachês',
    telefone: '5521995555555',
    estados_interesse: 'RJ, SP, BA',
    cache_tier: ['$', '$$', '$$$', '$$$$', '$$$$$'],
    ativo: true,
  },
];

// Ofertas de teste
const OFERTAS_TESTE = [
  {
    artista: 'Gusttavo Lima',
    data: new Date().toISOString().split('T')[0],
    estados: 'SP, RJ, MG, BA',
    cache_medio: 750000,
  },
  {
    artista: 'Maiara & Maraisa',
    data: new Date().toISOString().split('T')[0],
    estados: 'RS, SC',
    cache_medio: 375000,
  },
  {
    artista: 'Gloria Groove',
    data: new Date().toISOString().split('T')[0],
    estados: 'SP, RJ, BA, MG',
    cache_medio: 175000,
  },
  {
    artista: 'Melody',
    data: new Date().toISOString().split('T')[0],
    estados: 'RJ, SP, BA',
    cache_medio: 30000,
  },
];

async function criarClientesTeste() {
  console.log('\n📋 Criando clientes de teste...\n');

  for (const cliente of CLIENTES_TESTE) {
    try {
      const response = await axios.post(`${API_BASE}/clientes`, cliente);
      console.log(`✅ Cliente criado: ${cliente.nome.padEnd(35)} (ID: ${response.data.id})`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${cliente.nome}: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function dispararOfertas() {
  console.log('\n📤 Disparando ofertas...\n');

  for (const oferta of OFERTAS_TESTE) {
    try {
      const response = await axios.post(`${API_BASE}/ofertas`, oferta);
      console.log(`✅ Oferta: ${oferta.artista.padEnd(25)} | Cache: R$${oferta.cache_medio.toString().padEnd(6)} | ID: ${response.data.oferta_id}`);
    } catch (error) {
      console.error(`❌ Erro na oferta ${oferta.artista}: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function exibirDisparos() {
  console.log('\n📊 Disparos realizados:\n');

  try {
    const disparos = db.prepare(`
      SELECT
        d.id,
        c.nome as cliente,
        o.artista,
        o.cache_medio,
        d.status,
        d.data_disparo
      FROM disparos d
      JOIN clientes c ON d.cliente_id = c.id
      JOIN ofertas o ON d.oferta_id = o.id
      ORDER BY d.data_disparo DESC
      LIMIT 50
    `).all();

    if (disparos.length === 0) {
      console.log('Nenhum disparo realizado ainda.');
      return;
    }

    console.log('ID | Cliente                      | Artista              | Cache    | Status');
    console.log('-'.repeat(95));
    disparos.forEach(d => {
      const status = d.status === 'SUCESSO' ? '✅ SUCESSO' : '❌ ERRO';
      console.log(
        `${d.id.toString().padEnd(2)} | ${d.cliente.padEnd(28)} | ${d.artista.padEnd(20)} | R$${d.cache_medio.toString().padEnd(6)} | ${status}`
      );
    });

    console.log('\n');
  } catch (error) {
    console.error('Erro ao exibir disparos:', error.message);
  }
}

async function main() {
  console.log('🚀 TESTE COMPLETO - OFERTAS E CLIENTES\n');

  try {
    // 1. Criar clientes
    await criarClientesTeste();

    // 2. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Disparar ofertas
    await dispararOfertas();

    // 4. Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Exibir resultados
    await exibirDisparos();

    console.log('✨ Teste concluído!\n');
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }

  process.exit(0);
}

main().catch(console.error);
