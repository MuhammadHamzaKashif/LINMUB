import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getSwipeStack, recordSwipe } from '../controllers/interactionController.js';

const router = express.Router();

// GET /api/interactions/stack
router.get('/stack', protectRoute, getSwipeStack);

// POST /api/interactions/swipe
router.post('/swipe', protectRoute, recordSwipe);

export default router;