import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
  community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  scheduledDate: { type: Date, required: true },
  locationOrLink: { type: String } // physical address or online meeting link
}, { timestamps: true });

export default model('Event', eventSchema);