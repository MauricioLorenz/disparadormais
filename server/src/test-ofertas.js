import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { CACHE_TIERS } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeamento de rótulos de cache para valores numéricos (cache_medio)
const CACHE_LABELS_TO_VALUE = {
  '$ - 10 a 50 mil reais': 30000,
  '$$ - 50 a 100 mil reais': 75000,
  '$$$ - 100 a 250 mil reais': 175000,
  '$$$$ - 250 a 500 mil reais': 375000,
  '$$$$$ - Acima de 500 mil reais': 750000,
};

// Parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.error('CSV vazio ou inválido');
    return [];
  }

  const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
  const artistaIdx = headers.indexOf('artista');
  const estadoIdx = headers.indexOf('estado');
  const generoIdx = headers.indexOf('gênero') || headers.indexOf('genero');
  const cacheIdx = headers.findIndex(h => h.includes('media') || h.includes('cache'));

  if (artistaIdx === -1 || estadoIdx === -1 || cacheIdx === -1) {
    console.error('Colunas esperadas não encontradas');
    return [];
  }

  const ofertas = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim());
    if (values.length < Math.max(artistaIdx, estadoIdx, cacheIdx) + 1) continue;

    const artista = values[artistaIdx];
    const estados = values[estadoIdx];
    const cacheLabel = values[cacheIdx];

    // Parse cache_medio
    const cacheMedio = CACHE_LABELS_TO_VALUE[cacheLabel];
    if (!cacheMedio) {
      console.warn(`⚠️ Label de cache desconhecido: "${cacheLabel}"`);
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
    });
  }

  return ofertas;
}

// Disparar ofertas para a API
async function dispararOfertas(ofertas, apiUrl = 'http://localhost:3001/api/ofertas') {
  console.log(`\n📤 Disparando ${ofertas.length} ofertas para ${apiUrl}\n`);

  for (const oferta of ofertas) {
    try {
      const response = await axios.post(apiUrl, oferta);
      console.log(`✅ ${oferta.artista.padEnd(25)} | Estados: ${oferta.estados.split(',').length} | Cache: R$${oferta.cache_medio}`);
    } catch (error) {
      console.error(`❌ ${oferta.artista}: ${error.response?.data?.error || error.message}`);
    }
  }

  console.log('\n✨ Disparo concluído!\n');
}

// Main
async function main() {
  const csvPath = process.argv[2] || path.join(__dirname, '../export_All-Oportunidade-Data-Vendedors-modified_2026-03-17_16-18-51.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo não encontrado: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📂 Lendo CSV: ${path.basename(csvPath)}`);
  const ofertas = parseCSV(csvPath);

  if (ofertas.length === 0) {
    console.error('❌ Nenhuma oferta foi processada');
    process.exit(1);
  }

  console.log(`\n✔️ ${ofertas.length} ofertas parseadas com sucesso:\n`);
  ofertas.forEach((o, i) => {
    console.log(`${i + 1}. ${o.artista.padEnd(25)} | ${o.estados.split(',').length.toString().padStart(2)} estados | Cache: R$${o.cache_medio.toString().padEnd(6)}`);
  });

  // Disparar ofertas
  await dispararOfertas(ofertas);
}

main().catch(console.error);
