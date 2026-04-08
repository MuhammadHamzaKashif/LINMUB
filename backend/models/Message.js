import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: [
        {
            url: { type: String, required: true },
            fileType: { type: String, enum: ["image", "video"], required: true },
            altText: { type: String, default: "" },
        },
    ],
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default model('Message', messageSchema);