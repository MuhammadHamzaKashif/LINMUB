import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
  getCommunities, 
  createCommunity, 
  joinCommunity, 
  createEvent, 
  getCommunityEvents 
} from '../controllers/communityController.js';

const router = express.Router();

// Community Routes
router.get('/', protectRoute, getCommunities);
router.post('/', protectRoute, createCommunity);
router.post('/:communityId/join', protectRoute, joinCommunity);

// Event Routes
router.get('/:communityId/events', protectRoute, getCommunityEvents);
router.post('/:communityId/events', protectRoute, createEvent);

export default router;