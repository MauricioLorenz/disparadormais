import express from 'express';
import db from './db.js';

const router = express.Router();

// Listar histórico de disparos
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.execute(`
      SELECT
        d.id,
        d.status,
        d.data_disparo,
        c.nome as cliente_nome,
        o.artista as artista_nome,
        o.cache_medio as cache_value,
        o.data as oferta_data
      FROM disparos d
      JOIN clientes c ON d.cliente_id = c.id
      JOIN ofertas o ON d.oferta_id = o.id
      ORDER BY d.data_disparo DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resumo dos disparos (para o Dashboard)
router.get('/resumo', async (_req, res) => {
  try {
    const [total, sucessos, erros] = await Promise.all([
      db.execute('SELECT count(*) as count FROM disparos'),
      db.execute("SELECT count(*) as count FROM disparos WHERE status = 'SUCESSO'"),
      db.execute("SELECT count(*) as count FROM disparos WHERE status LIKE 'ERRO%'"),
    ]);

    res.json({
      total: total.rows[0].count,
      sucessos: sucessos.rows[0].count,
      erros: erros.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
