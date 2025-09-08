import express from 'express';
import { 
  getSuggestedPosts, 
  approvePost, 
  rejectPost, 
  convertToBanner, 
  deleteSuggestedPost 
} from '../controllers/suggestedPostController';

const router = express.Router();

// GET /suggested-posts
router.get('/', (req, res, next) => {
  getSuggestedPosts(req, res).catch(next);
});

// PUT /suggested-posts/:id/approve
router.put('/:id/approve', (req, res, next) => {
  approvePost(req, res).catch(next);
});

// PUT /suggested-posts/:id/reject
router.put('/:id/reject', (req, res, next) => {
  rejectPost(req, res).catch(next);
});

// POST /suggested-posts/:id/convert-to-banner
router.post('/:id/convert-to-banner', (req, res, next) => {
  convertToBanner(req, res).catch(next);
});

// DELETE /suggested-posts/:id
router.delete('/:id', (req, res, next) => {
  deleteSuggestedPost(req, res).catch(next);
});

export default router;
