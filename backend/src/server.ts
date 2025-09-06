import express from 'express';
import dotenv from 'dotenv';
import bannerRoutes from './routes/bannerRoutes';
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});