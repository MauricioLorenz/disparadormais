import express from 'express';
import db from './db.js';

const router = express.Router();

// Listar todos os templates
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.execute('SELECT * FROM templates');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar template
router.post('/', async (req, res) => {
  const { nome, texto, padrao } = req.body;
  if (!nome || !texto) {
    return res.status(400).json({ error: 'Nome e texto são obrigatórios.' });
  }

  try {
    if (padrao) {
      await db.execute('UPDATE templates SET padrao = 0');
    }
    const result = await db.execute({
      sql: 'INSERT INTO templates (nome, texto, padrao) VALUES (?, ?, ?)',
      args: [nome, texto, padrao ? 1 : 0],
    });
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar template
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, texto, padrao } = req.body;

  try {
    if (padrao) {
      await db.execute('UPDATE templates SET padrao = 0');
    }
    const result = await db.execute({
      sql: 'UPDATE templates SET nome = ?, texto = ?, padrao = ? WHERE id = ?',
      args: [nome, texto, padrao ? 1 : 0, id],
    });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Template não encontrado' });
    res.json({ message: 'Template atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover template
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({ sql: 'DELETE FROM templates WHERE id = ?', args: [id] });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Template não encontrado' });
    res.json({ message: 'Template excluído' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
