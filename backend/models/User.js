import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  bio: { type: String, default: '' },
  age: { type: Number },
  gender: { type: String },
  interests: [{ type: String }],
  // Stores the AI-generated mathematical representation of interests
  interestEmbedding: { 
    type: [Number],
    default: []
  },
  socializingCapability: { 
    type: String, 
    enum: ['Listener', 'Takes Time', 'Open Communicator'],
    default: 'Takes Time'
  }
}, { timestamps: true });

export default model('User', userSchema);