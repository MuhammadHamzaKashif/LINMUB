import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { 
  getCommunities, 
  createCommunity, 
  joinCommunity, 
  createEvent, 
  getCommunityEvents,
  getPendingEvents,
  updateEventStatus,
  getCommunityMembers,
  promoteToAdmin
} from '../controllers/communityController.js';

const router = express.Router();

// Community Routes
router.get('/', protectRoute, getCommunities);
router.post('/', protectRoute, createCommunity);
router.post('/:communityId/join', protectRoute, joinCommunity);
router.get('/:communityId/members', protectRoute, getCommunityMembers);
router.put('/:communityId/promote/:userIdToPromote', protectRoute, promoteToAdmin);

// Event Routes
router.get('/:communityId/events', protectRoute, getCommunityEvents);
router.get('/:communityId/events/pending', protectRoute, getPendingEvents);
router.post('/:communityId/events', protectRoute, createEvent);
router.put('/:communityId/events/:eventId/status', protectRoute, updateEventStatus);

export default router;