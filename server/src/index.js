import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas Básicas de Verificação
app.get('/api/status', (_req, res) => {
  res.json({ status: 'API Online', db: 'Turso Conectado' });
});

import clientesRoutes from './clientes.js';
import ofertasRoutes from './ofertas.js';
import templatesRoutes from './templates.js';
import disparosRoutes from './disparos.js';

app.use('/api/clientes', clientesRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/disparos', disparosRoutes);

// Inicializar banco e subir servidor
const PORT = process.env.PORT || 3001;
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar banco de dados:', err);
    process.exit(1);
  });

export default app;
