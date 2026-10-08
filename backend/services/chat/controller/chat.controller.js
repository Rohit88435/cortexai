import Conversation from "../models/converstaion.model.js";
import Message from "../models/message.model.js";

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "userId header is required" });
    }

    const conversation = await Conversation.create({
      userId,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `create conversation error ${error}` });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({ message: "userId header is required" });
    }

    const conversations = await Conversation.find({
      userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: `get conversation error ${error}` });
  }
};

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body;

    const conversation = await Conversation.findByIdAndUpdate(id, {
      title,
    });

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: `get conversation error ${error}` });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts, attachment } = req.body;

    const messages = await Message.create({
      conversationId,
      role,
      content,
      images,
      artifacts,
      attachment,
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `save  Messages error ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: `get Messages error ${error}` });
  }
};
