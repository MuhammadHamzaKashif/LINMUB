import { Schema, model } from "mongoose";

const thoughtSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      maxLength: 280,
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },

    resonates: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    media: [
      {
        url: { type: String, required: true },
        fileType: { type: String, enum: ["image", "video"], required: true },
        altText: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

export default model("Thought", thoughtSchema);
