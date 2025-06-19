import express from 'express';
import multer from 'multer';
import { uploadBanner, getBanners } from '../controllers/bannerController';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.single('imagem'), (req, res, next) => {
  uploadBanner(req, res).catch(next);
});

// Nova rota GET para listar banners
router.get('/', (req, res, next) => {
  getBanners(req, res).catch(next);
});

export default router;