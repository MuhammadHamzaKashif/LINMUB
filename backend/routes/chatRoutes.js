import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { accessConversation, sendMessage, getMessages, getUserConversations } from '../controllers/chatController.js';

const router = express.Router();

// GET /api/chat
router.get('/', protectRoute, getUserConversations);

// POST /api/chat
router.post('/', protectRoute, accessConversation);

// POST /api/chat/message
router.post('/message', protectRoute, sendMessage);

// GET /api/chat/:conversationId/messages
router.get('/:conversationId/messages', protectRoute, getMessages);

export default router;