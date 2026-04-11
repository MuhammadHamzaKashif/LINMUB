import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import thoughtRoutes from './routes/thoughtRoutes.js' 
import chatRoutes from './routes/chatRoutes.js' 
import interactionRoutes from './routes/interactionRoutes.js'
import communityRoutes from './routes/communityRoutes.js'

dotenv.config()
const app = express();

app.use(cors());
app.use(json());

connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/thoughts', thoughtRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/communities', communityRoutes);

app.get('/', (req, res) => {
  res.send('LINMUB API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});