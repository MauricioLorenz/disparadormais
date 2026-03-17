import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL UNIQUE,
      estados_interesse TEXT NOT NULL,
      cache_tier TEXT NOT NULL,
      cache_min INTEGER NOT NULL,
      cache_max INTEGER NOT NULL,
      ativo BOOLEAN DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS ofertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      artista TEXT NOT NULL,
      data TEXT NOT NULL,
      estados TEXT NOT NULL,
      cache_medio INTEGER NOT NULL,
      data_recebimento DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      texto TEXT NOT NULL,
      padrao BOOLEAN DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS disparos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oferta_id INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      mensagem TEXT NOT NULL,
      status TEXT NOT NULL,
      data_disparo DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oferta_id) REFERENCES ofertas (id) ON DELETE CASCADE,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
    )`,
  ], 'deferred');

  // Seed template padrão se não existir
  const { rows } = await db.execute('SELECT count(*) as count FROM templates');
  if (rows[0].count === 0) {
    await db.execute({
      sql: 'INSERT INTO templates (nome, texto, padrao) VALUES (?, ?, ?)',
      args: [
        'Template Padrão',
        '{{#topo}}\nOlá {{nome}}, \n\nTemos {{quantidadeOfertas}} oferta(s) que pode te interessar!\n{{/topo}}\n{{#oferta}}\n🎙️ {{nome_artista}}\n🗓️ Data: {{data}}\n📍 Estados: {{estados}}\n💰 Média de Cachê: {{media_cache}}\n\n{{/oferta}}\n{{#rodape}}\nTem interesse em alguma? Acesse seu painel:\n- Menu Roteiros\n{{/rodape}}',
        1,
      ],
    });
  }
}

export default db;
