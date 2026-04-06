import { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isInstantMatch: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  suggestedTopics: [{ type: String }] 
}, { timestamps: true });

export default model('Conversation', conversationSchema);