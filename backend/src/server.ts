import express from 'express';
import dotenv from 'dotenv';
import bannerRoutes from './routes/bannerRoutes';
import siteRoutes from './routes/siteRoutes';
import suggestedPostRoutes from './routes/suggestedPostRoutes';
import { SchedulerService } from './services/schedulerService';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.includes('/upload')) {
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
  }
  next();
});

app.use('/banners', bannerRoutes);
app.use('/sites', siteRoutes);
app.use('/suggested-posts', suggestedPostRoutes);

// Inicializar Scheduler Service
const schedulerService = new SchedulerService();

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Iniciar o scheduler após o servidor estar rodando
  try {
    await schedulerService.start();
  } catch (error) {
    console.error('Erro ao iniciar scheduler:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Recebido SIGINT. Parando servidor...');
  await schedulerService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM. Parando servidor...');
  await schedulerService.stop();
  process.exit(0);
});