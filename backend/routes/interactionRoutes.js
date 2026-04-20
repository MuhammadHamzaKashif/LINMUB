import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getSwipeStack, recordSwipe, getCommonGrounds } from '../controllers/interactionController.js';

const router = express.Router();

// GET /api/interactions/stack
router.get('/stack', protectRoute, getSwipeStack);

// POST /api/interactions/swipe
router.post('/swipe', protectRoute, recordSwipe);

// GET /api/interactions/common-grounds
router.get('/common-grounds', protectRoute, getCommonGrounds);

export default router;