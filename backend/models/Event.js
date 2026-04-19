import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
  community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizerAlias: { type: String }, // Store the alias at creation
  title: { type: String, required: true },
  description: { type: String },
   scheduledDate: { type: Date, required: true },
  time: { type: String }, // e.g., "14:00"
  locationOrLink: { type: String }, // physical address or online meeting link
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default model('Event', eventSchema);