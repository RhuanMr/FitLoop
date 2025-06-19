import express from 'express';
import dotenv from 'dotenv';
import bannerRoutes from './routes/bannerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/banners', bannerRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});