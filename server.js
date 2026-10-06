import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import app from './api/index.js';
import { connectDB } from './api/config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Em ambiente de desenvolvimento local, serve os arquivos estáticos do frontend
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// Redireciona qualquer rota web para a interface Single Page
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  return res.sendFile(path.join(frontendPath, 'index.html'));
});

// Inicialização do servidor HTTP e conexão prévia com o banco
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`📱 Mini Gerenciamento de Celulares`);
  console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`🔌 API REST disponível em: http://localhost:${PORT}/api/celulares`);
  console.log(`===============================================`);

  try {
    await connectDB();
    console.log(`✅ Banco de dados pronto para operações.`);
  } catch (err) {
    console.warn(`⚠️ Aviso de conexão com banco de dados: ${err.message}`);
  }
});

// Encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  server.close(async () => {
    if (global.__mongoMemoryServer) {
      try {
        await global.__mongoMemoryServer.stop();
      } catch (_) {}
    }
    process.exit(0);
  });
});

