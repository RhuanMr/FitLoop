import express from 'express';
import { getSites, createSite, updateSite, deleteSite, testSite, getSelectorsForUrl } from '../controllers/siteController';

const router = express.Router();

// GET /sites
router.get('/', (req, res, next) => {
  getSites(req, res).catch(next);
});

// POST /sites
router.post('/', (req, res, next) => {
  createSite(req, res).catch(next);
});

// PUT /sites/:id
router.put('/:id', (req, res, next) => {
  updateSite(req, res).catch(next);
});

// DELETE /sites/:id
router.delete('/:id', (req, res, next) => {
  deleteSite(req, res).catch(next);
});

// POST /sites/:id/test
router.post('/:id/test', (req, res, next) => {
  testSite(req, res).catch(next);
});

// GET /sites/selectors/:url
router.get('/selectors/:url', (req, res, next) => {
  getSelectorsForUrl(req, res).catch(next);
});

export default router;
