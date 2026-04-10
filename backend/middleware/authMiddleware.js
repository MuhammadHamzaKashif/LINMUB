import jwt from 'jsonwebtoken';
import User from '../models/User.js';


/*
    - Get token from request and verify it
    - search db for the user using the userid extracted from token
    - get all user data except password cus it hashed and we dont share that yk
    - add this data to request and move onto the real function

*/

export const protectRoute = async (req, res, next) => {
  let token;

  // token format is 'Bearer <token string>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists.' });
      }

      next();
    } catch (error) {
      console.error("Auth Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};