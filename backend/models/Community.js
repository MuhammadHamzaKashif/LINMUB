import { Schema, model } from "mongoose";

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: { type: String },
    niche: { type: String },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        temporaryUsername: { type: String, required: true },
        isIdentityRevealed: { type: Boolean, default: false },
        role: { type: String, enum: ['member', 'admin'], default: 'member' }
      },
    ],
  },
  { timestamps: true },
);

export default model("Community", communitySchema);
