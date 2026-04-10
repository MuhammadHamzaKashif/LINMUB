import express from 'express';
import { createThought, getThoughtFeed, resonateThought } from '../controllers/thoughtController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/thoughts
router.get('/', protectRoute, getThoughtFeed);

// POST /api/thoughts
router.post('/', protectRoute, createThought);

// PUT /api/thoughts/:id/resonate
router.put('/:id/resonate', protectRoute, resonateThought);

export default router;