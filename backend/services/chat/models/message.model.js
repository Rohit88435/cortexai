import mongoose, { Mongoose } from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: String,
    content: String,
  },
  {
    _id: false,
  },
);

const artifactSchema = new mongoose.Schema(
  {
    id: Number,
    type: String,
    title: String,
    files: [fileSchema],
  },
  {
    _id: false,
  },
);

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    url: String,
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    role: {
      type: String,
      enum: ["user", "assistant", "assistent"],
    },
    content: String,
    images: [String],
    attachment: attachmentSchema,
    artifacts: [artifactSchema],
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
