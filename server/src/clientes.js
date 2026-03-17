import express from 'express';
import db from './db.js';
import { CACHE_TIERS } from './constants.js';

const router = express.Router();

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute('SELECT * FROM clientes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar um novo cliente
router.post('/', async (req, res) => {
  const { nome, telefone, estados_interesse, cache_tier, ativo } = req.body;

  if (!nome || !telefone || !estados_interesse || !cache_tier || (Array.isArray(cache_tier) && cache_tier.length === 0)) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const tiers = Array.isArray(cache_tier) ? cache_tier : cache_tier.split(',').map(t => t.trim());
  const invalidTier = tiers.find(t => !CACHE_TIERS[t]);
  if (invalidTier) {
    return res.status(400).json({ error: `Faixa de cachê inválida: ${invalidTier}` });
  }

  const min = Math.min(...tiers.map(t => CACHE_TIERS[t].min));
  const max = Math.max(...tiers.map(t => CACHE_TIERS[t].max));
  const tierString = tiers.join(', ');

  try {
    const result = await db.execute({
      sql: 'INSERT INTO clientes (nome, telefone, estados_interesse, cache_tier, cache_min, cache_max, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [nome, telefone, estados_interesse, tierString, min, max, ativo !== false ? 1 : 0],
    });
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Já existe um cliente com este telefone.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, estados_interesse, cache_tier, ativo } = req.body;

  if (!cache_tier || (Array.isArray(cache_tier) && cache_tier.length === 0)) {
    return res.status(400).json({ error: 'Selecione pelo menos uma faixa de cachê.' });
  }

  const tiers = Array.isArray(cache_tier) ? cache_tier : cache_tier.split(',').map(t => t.trim());
  const invalidTier = tiers.find(t => !CACHE_TIERS[t]);
  if (invalidTier) {
    return res.status(400).json({ error: `Faixa de cachê inválida: ${invalidTier}` });
  }

  const min = Math.min(...tiers.map(t => CACHE_TIERS[t].min));
  const max = Math.max(...tiers.map(t => CACHE_TIERS[t].max));
  const tierString = tiers.join(', ');

  try {
    const result = await db.execute({
      sql: 'UPDATE clientes SET nome = ?, telefone = ?, estados_interesse = ?, cache_tier = ?, cache_min = ?, cache_max = ?, ativo = ? WHERE id = ?',
      args: [nome, telefone, estados_interesse, tierString, min, max, ativo !== false ? 1 : 0, id],
    });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute({ sql: 'DELETE FROM clientes WHERE id = ?', args: [id] });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
