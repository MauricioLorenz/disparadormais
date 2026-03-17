import db from './db.js';
import axios from 'axios';

// Clientes de teste para melhor demonstração
const CLIENTES_TESTE = [
  {
    nome: 'João Silva - Baixo Cachê',
    telefone: '5548999999991',
    estados_interesse: 'SP, RJ, MG, BA',
    cache_tier: ['$', '$$'],
    ativo: true,
  },
  {
    nome: 'Maria Santos - Médio Cachê',
    telefone: '5511988888881',
    estados_interesse: 'SP, SC, RS, BA',
    cache_tier: ['$$', '$$$'],
    ativo: true,
  },
  {
    nome: 'Pedro Oliveira - Alto Cachê',
    telefone: '5585987654321',
    estados_interesse: 'SP, RJ, BA, MG',
    cache_tier: ['$$$', '$$$$', '$$$$$'],
    ativo: true,
  },
];

// Criar clientes de teste se não existirem
async function criarClientesTeste() {
  const API_BASE = 'http://localhost:3001/api';

  console.log('👥 Criando clientes de teste...\n');

  for (const cliente of CLIENTES_TESTE) {
    try {
      await axios.post(`${API_BASE}/clientes`, cliente);
      console.log(`✅ ${cliente.nome}`);
    } catch (error) {
      // Cliente pode já existir, ignorar
    }
  }
  console.log('');
}

// Replicar a lógica de matching de ofertas.js
async function processarMatchDeOfertas() {
  console.log('🔄 Iniciando process de matching...\n');

  // Buscar todas as ofertas
  const ofertas = db.prepare('SELECT * FROM ofertas ORDER BY id DESC LIMIT 50').all();

  if (ofertas.length === 0) {
    console.log('❌ Nenhuma oferta encontrada');
    process.exit(1);
  }

  console.log(`📋 Processando ${ofertas.length} ofertas...\n`);

  let totalDisparos = 0;

  for (const oferta of ofertas) {
    const { id: ofertaId, artista, data, estados, cache_medio } = oferta;
    const estadosOferta = estados.split(',').map(e => e.trim().toUpperCase());

    // Buscar clientes ativos
    const clientes = db.prepare('SELECT * FROM clientes WHERE ativo = 1').all();

    console.log(`\n🎤 ${artista} (R$${cache_medio}) - Estados: ${estadosOferta.join(', ')}`);

    let matches = 0;

    for (const cliente of clientes) {
      // 1. Validar Cache
      const cacheMatch = cliente.cache_min <= cache_medio && cliente.cache_max >= cache_medio;

      // 2. Validar Estados
      const estadosCliente = cliente.estados_interesse.split(',').map(e => e.trim().toUpperCase());
      const estadosMatchBool = estadosCliente.some(estCliente => estadosOferta.includes(estCliente));

      if (cacheMatch && estadosMatchBool) {
        matches++;
        totalDisparos++;

        // Verificar se disparo já existe
        const jaDisparon = db.prepare(`
          SELECT id FROM disparos WHERE oferta_id = ? AND cliente_id = ?
        `).get(ofertaId, cliente.id);

        if (!jaDisparon) {
          db.prepare(`
            INSERT INTO disparos (oferta_id, cliente_id, mensagem, status)
            VALUES (?, ?, ?, ?)
          `).run(ofertaId, cliente.id, `Oferta para ${artista}`, 'SIMULADO');

          console.log(`  ✅ ${cliente.nome.padEnd(35)} | Cache: R$${cliente.cache_min}-R$${cliente.cache_max} | Estados: ${cliente.estados_interesse.substring(0, 20)}...`);
        }
      }
    }

    console.log(`  └─ ${matches} clientes match`);
  }

  console.log(`\n✨ Total de disparos realizados: ${totalDisparos}\n`);

  // Exibir resumo
  exibirResumoDipos();

  process.exit(0);
}

function exibirResumoDipos() {
  console.log('\n📊 RESUMO DOS DISPAROS:\n');

  const disparos = db.prepare(`
    SELECT
      c.nome as cliente,
      COUNT(DISTINCT d.oferta_id) as num_ofertas,
      GROUP_CONCAT(o.artista, ', ') as artistas,
      COUNT(*) as total_disparos
    FROM disparos d
    JOIN clientes c ON d.cliente_id = c.id
    JOIN ofertas o ON d.oferta_id = o.id
    WHERE d.status IN ('SIMULADO', 'SUCESSO')
    GROUP BY c.id
    ORDER BY total_disparos DESC
  `).all();

  if (disparos.length === 0) {
    console.log('Nenhum disparo registrado.');
    return;
  }

  console.log('Cliente                      | Ofertas | Artistas');
  console.log('-'.repeat(100));
  disparos.forEach(d => {
    const artistas = d.artistas.length > 40 ? d.artistas.substring(0, 37) + '...' : d.artistas;
    console.log(`${d.cliente.padEnd(28)} | ${d.num_ofertas.toString().padStart(7)} | ${artistas}`);
  });

  console.log('\n');
}

async function main() {
  await criarClientesTeste();
  await processarMatchDeOfertas();
}

main().catch(console.error);
