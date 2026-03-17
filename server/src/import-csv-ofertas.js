import fs from 'fs';
import path from 'path';
import db from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeamento de rótulos de cache para valores numéricos (cache_medio)
const CACHE_LABELS_TO_VALUE = {
  '$ - 10 a 50 mil reais': 30000,
  '$$ - 50 a 100 mil reais': 75000,
  '$$$ - 100 a 250 mil reais': 175000,
  '$$$$ - 250 a 500 mil reais': 375000,
  '$$$$$ - Acima de 500 mil reais': 750000,
  '$ - 10 a 50 mil': 30000,
  '$$ - 50 a 100 mil': 75000,
  '$$$ - 100 a 250 mil': 175000,
  '$$$$ - 250 a 500 mil': 375000,
  '$$$$$ - Acima de 500 mil': 750000,
};

// Parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.error('❌ CSV vazio ou inválido');
    return [];
  }

  const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
  const artistaIdx = headers.indexOf('artista');
  const estadoIdx = headers.indexOf('estado');
  const generoIdx = headers.indexOf('gênero') || headers.indexOf('genero');
  const cacheIdx = headers.findIndex(h => h.includes('media') || h.includes('cache'));

  if (artistaIdx === -1 || estadoIdx === -1 || cacheIdx === -1) {
    console.error('❌ Colunas esperadas não encontradas no CSV');
    console.error(`   Headers encontrados: ${headers.join(', ')}`);
    return [];
  }

  const ofertas = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim());
    if (values.length < Math.max(artistaIdx, estadoIdx, cacheIdx) + 1) continue;

    const artista = values[artistaIdx];
    const estados = values[estadoIdx];
    const cacheLabel = values[cacheIdx];

    if (!artista || !estados) continue;

    // Parse cache_medio
    let cacheMedio = CACHE_LABELS_TO_VALUE[cacheLabel];

    // Tentar variações do label
    if (!cacheMedio) {
      for (const [key, value] of Object.entries(CACHE_LABELS_TO_VALUE)) {
        if (cacheLabel.includes(key.split(' - ')[0])) {
          cacheMedio = value;
          break;
        }
      }
    }

    if (!cacheMedio) {
      console.warn(`⚠️  Label de cache desconhecido: "${cacheLabel}"`);
      continue;
    }

    // Normalizar estados (remover espaços extras, converter para maiúsculas)
    const estadosNormalizados = estados
      .split(',')
      .map(e => e.trim().toUpperCase())
      .filter(e => e)
      .join(', ');

    ofertas.push({
      artista,
      data: new Date().toISOString().split('T')[0],
      estados: estadosNormalizados,
      cache_medio: cacheMedio,
      genero: values[generoIdx] || '',
    });
  }

  return ofertas;
}

// Inserir ofertas no banco de dados
function inserirOfertas(ofertas) {
  console.log(`\n💾 Inserindo ${ofertas.length} ofertas no banco de dados...\n`);

  const stmt = db.prepare(`
    INSERT INTO ofertas (artista, data, estados, cache_medio)
    VALUES (?, ?, ?, ?)
  `);

  let sucesso = 0;
  let erro = 0;

  for (const oferta of ofertas) {
    try {
      const info = stmt.run(oferta.artista, oferta.data, oferta.estados, oferta.cache_medio);
      console.log(`✅ ${oferta.artista.padEnd(30)} | ${oferta.estados.split(',').length.toString().padStart(2)} estados | Cache: R$${oferta.cache_medio.toString().padEnd(6)}`);
      sucesso++;
    } catch (error) {
      console.error(`❌ ${oferta.artista}: ${error.message}`);
      erro++;
    }
  }

  console.log(`\n✨ Resultado: ${sucesso} inseridas, ${erro} erros\n`);
  return sucesso;
}

// Exibir ofertas inseridas
function exibirOfertasInseridas() {
  console.log('\n📋 Ofertas no banco de dados:\n');

  const ofertas = db.prepare(`
    SELECT id, artista, data, estados, cache_medio, data_recebimento
    FROM ofertas
    ORDER BY data_recebimento DESC
    LIMIT 50
  `).all();

  if (ofertas.length === 0) {
    console.log('Nenhuma oferta no banco.');
    return;
  }

  console.log('ID | Artista                        | Data       | Estados  | Cache    | Recebida em');
  console.log('-'.repeat(110));
  ofertas.forEach(o => {
    const estadosCount = o.estados.split(',').length;
    console.log(
      `${o.id.toString().padEnd(2)} | ${o.artista.padEnd(30)} | ${o.data} | ${estadosCount.toString().padStart(2)} est. | R$${o.cache_medio.toString().padEnd(6)} | ${o.data_recebimento}`
    );
  });

  console.log('\n');
}

// Main
async function main() {
  const csvPath = process.argv[2] || path.join(process.cwd(), 'export_All-Oportunidade-Data-Vendedors-modified_2026-03-17_16-18-51.csv');

  console.log('🚀 IMPORTADOR DE OFERTAS CSV\n');
  console.log(`📂 Procurando CSV em: ${path.basename(csvPath)}\n`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo não encontrado: ${csvPath}`);
    console.log(`\n💡 Use: node src/import-csv-ofertas.js "/caminho/completo/arquivo.csv"\n`);
    process.exit(1);
  }

  const ofertas = parseCSV(csvPath);

  if (ofertas.length === 0) {
    console.error('❌ Nenhuma oferta foi processada');
    process.exit(1);
  }

  console.log(`✔️ ${ofertas.length} ofertas parseadas com sucesso:\n`);
  ofertas.forEach((o, i) => {
    console.log(`${(i + 1).toString().padEnd(2)}. ${o.artista.padEnd(30)} | ${o.estados.split(',').length.toString().padStart(2)} est. | Cache: R$${o.cache_medio.toString().padEnd(6)}`);
  });

  // Inserir no banco
  const inseridas = inserirOfertas(ofertas);

  if (inseridas > 0) {
    exibirOfertasInseridas();
    console.log('✨ Ofertas importadas com sucesso! Visite a página /ofertas para ver.\n');
  }

  process.exit(0);
}

main().catch(console.error);
