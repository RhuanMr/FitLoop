import express from 'express';
import multer from 'multer';
import { uploadBanner, getBanners, updateBanner } from '../controllers/bannerController';

const router = express.Router();
const upload = multer();

// POST /banners/upload
router.post('/upload', upload.single('imagem'), (req, res, next) => {
  uploadBanner(req, res).catch(next);
});

// PUT /banners/:id (edição)
router.put('/:id', upload.single('imagem'), (req, res, next) => {
  updateBanner(req, res).catch(next);
});

// GET /banners (listagem paginada e filtrada)
router.get('/', (req, res, next) => {
  getBanners(req, res).catch(next);
});

export default router;