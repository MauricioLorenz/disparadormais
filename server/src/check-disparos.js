import db from './db.js';

console.log('\n📊 VERIFICANDO DISPAROS NO BANCO\n');

const disparos = db.prepare(`
  SELECT d.id, c.nome, o.artista, o.cache_medio, d.status, d.data_disparo
  FROM disparos d
  JOIN clientes c ON d.cliente_id = c.id
  JOIN ofertas o ON d.oferta_id = o.id
  ORDER BY d.data_disparo DESC
`).all();

console.log(`Total de disparos: ${disparos.length}\n`);

if (disparos.length === 0) {
  console.log('❌ Nenhum disparo encontrado!\n');
} else {
  console.log('ID | Cliente                        | Artista              | Cache    | Status');
  console.log('-'.repeat(100));
  disparos.forEach(d => {
    console.log(
      `${d.id.toString().padEnd(2)} | ${d.nome.padEnd(30)} | ${d.artista.padEnd(20)} | R$${d.cache_medio.toString().padEnd(6)} | ${d.status}`
    );
  });
  console.log('');
}

// Verificar clientes
console.log('\n👥 CLIENTES NO BANCO:\n');
const clientes = db.prepare('SELECT id, nome, cache_min, cache_max, estados_interesse FROM clientes').all();
console.log(`Total de clientes: ${clientes.length}\n`);
clientes.forEach(c => {
  console.log(`${c.id}. ${c.nome}`);
  console.log(`   Cache: R$${c.cache_min} - R$${c.cache_max}`);
  console.log(`   Estados: ${c.estados_interesse}\n`);
});

// Verificar ofertas
console.log('\n🎤 OFERTAS NO BANCO:\n');
const ofertas = db.prepare('SELECT id, artista, cache_medio, estados FROM ofertas LIMIT 5').all();
console.log(`Total de ofertas: ${db.prepare('SELECT COUNT(*) as cnt FROM ofertas').get().cnt}\n`);
ofertas.forEach(o => {
  console.log(`${o.id}. ${o.artista} - R$${o.cache_medio}`);
  console.log(`   Estados: ${o.estados}\n`);
});
