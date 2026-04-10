import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/*
    Func for sign up 
    - Takes args from the request
    - checks on basis of username if alrdy exists
    - if not add user with hashed password
    - creates a token for instant signin for later
    - sends token with response
*/
export const registerUser = async (req, res) => {
  try {
    const { username, password, bio, socializingCapability } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken. Try another one!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      bio,
      socializingCapability
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // expires in 7 days
    );

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        bio: newUser.bio
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/*
    Func for sign in 
    - Takes args from the request
    - compares hashed password
    - if matched creates a token
    - sends token and userdata with response
*/
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        isVisible: user.isVisible
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};