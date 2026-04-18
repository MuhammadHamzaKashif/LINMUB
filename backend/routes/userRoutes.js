import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { updateProfile } from '../controllers/userController.js';

const router = express.Router();

// /api/users/me
router.get('/me', protectRoute, async (req, res) => {
  try {
    // Because of middleware, req.user is guaranteed to exist
    res.status(200).json({
      message: "Access granted!",
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// /api/users/profile
router.put('/profile', protectRoute, updateProfile);

export default router;