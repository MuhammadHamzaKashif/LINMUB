import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/*
    Func for starting a chat or spinoff if starting chat from a thought
    - check if convo alrdy exists
    - if exists return that
    - else create new chat and add it to db
    - then fetch the newly created convo
*/
export const accessConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required." });
    }

    let conversation = await Conversation.findOne({
      isAnonymous: false, // standard DMs
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: targetUserId } } },
      ],
    }).populate('participants', 'username socializingCapability');

    if (conversation) {
      return res.status(200).json(conversation);
    }

    const newConversation = new Conversation({
      participants: [req.user._id, targetUserId],
      isInstantMatch: false,
      isAnonymous: false
    });

    await newConversation.save();

    const fullConversation = await Conversation.findById(newConversation._id)
      .populate('participants', 'username socializingCapability');

    res.status(201).json(fullConversation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/*
    Func to sned a message
    - create a message and add it to db with convo id
    - the convo needs to have its updateAt field updated
*/
export const sendMessage = async (req, res) => {
  try {
    const { content, conversationId, media } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({ message: "Invalid data passed into request" });
    }

    const newMessage = new Message({
      sender: req.user._id,
      content: content,
      conversation: conversationId,
      media: media || []
    });

    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/*
    Func to get all msgs in a chat
    - uh jus get all msgs
*/
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 }); // sort oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/*
    Func to get all chats for a user
    - find convos where user is a participant
    - populate participants
    - sort by recently updated
*/
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $elemMatch: { $eq: req.user._id } }
    })
    .populate('participants', 'username socializingCapability')
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};