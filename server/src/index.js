import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbReady } from './db.js';
import clientesRoutes from './clientes.js';
import ofertasRoutes from './ofertas.js';
import templatesRoutes from './templates.js';
import disparosRoutes from './disparos.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ type: ['application/json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));

// Garante que o banco está pronto antes de processar qualquer requisição
app.use(async (_req, _res, next) => {
  await dbReady;
  next();
});

// Rotas
app.get('/api/status', (_req, res) => {
  res.json({ status: 'API Online', db: process.env.TURSO_DATABASE_URL || 'file:local.db' });
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/disparos', disparosRoutes);

// Servidor local (não Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

export default app;
