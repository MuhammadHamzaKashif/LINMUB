import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Community from '../models/Community.js';

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

export const accessCommunityChat = async (req, res) => {
  try {
    const { communityId } = req.params;

    // Check if user is member
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const isMember = community.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: "Join the community to access its chat" });

    // Find or create group conversation
    let conversation = await Conversation.findOne({
      community: communityId,
      type: 'group'
    });

    if (!conversation) {
      conversation = new Conversation({
        community: communityId,
        type: 'group',
        participants: community.members.map(m => m.user)
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
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

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    let senderAlias = null;

    // If it's a community group chat, resolve the alias
    if (conversation.type === 'group' && conversation.community) {
      const community = await Community.findById(conversation.community);
      const memberInfo = community?.members.find(m => m.user.toString() === req.user._id.toString());
      senderAlias = memberInfo?.temporaryUsername;
    }

    // Extract mentions efficiently
    const mentions = [];
    if (conversation.type === 'group' && conversation.community) {
      const community = await Community.findById(conversation.community);
      if (community) {
        // Sort by length descending to match longest possible alias first
        const aliases = community.members
          .map(m => m.temporaryUsername)
          .filter(Boolean)
          .sort((a, b) => b.length - a.length);

        if (aliases.length > 0) {
          const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = `@(${aliases.map(a => escapeRegExp(a)).join('|')})`;
          const regex = new RegExp(pattern, 'g');
          let match;
          while ((match = regex.exec(content)) !== null) {
            mentions.push(match[1]);
          }
        }
      }
    }

    const newMessage = new Message({
      sender: req.user._id,
      senderAlias,
      mentions,
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