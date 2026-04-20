import Interaction from '../models/Interaction.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';




/*
    this real shat
    - if vector embedding of user exists onli then continue
    - find prev swiped users and add em into a stack
    - ts (this stack) is of users we dont need
    - ts (this stack) so me
    - then we do real shat search which is sum peak mahou

*/
export const getSwipeStack = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.interestEmbedding || currentUser.interestEmbedding.length === 0) {
      return res.status(400).json({ message: "Please update your interests first to generate your AI profile." });
    }

    const previousInteractions = await Interaction.find({ swiper: req.user._id }).select('swipee');
    const swipedUserIds = previousInteractions.map(interaction => interaction.swipee);
    swipedUserIds.push(req.user._id);

    const users = await User.aggregate([
      // The Vector Search
      {
        $vectorSearch: {
          index: "vector_index", // created in atlas
          path: "interestEmbedding",
          queryVector: currentUser.interestEmbedding,
          numCandidates: 100,
          limit: 10 // top 10 best matches
        }
      },
      {
        $match: {
          _id: { $nin: swipedUserIds },
          isVisible: true
        }
      },
      {
        $addFields: {
          matchScore: { $meta: "vectorSearchScore" }
        }
      },
      {
        $project: { password: 0, interestEmbedding: 0 } // Hide sensitive/heavy data
      }
    ]);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCommonGrounds = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.interestEmbedding || currentUser.interestEmbedding.length === 0) {
      return res.status(200).json([]); // No profile, no common grounds
    }

    const similarUsers = await User.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "interestEmbedding",
          queryVector: currentUser.interestEmbedding,
          numCandidates: 50,
          limit: 10
        }
      },
      { $match: { _id: { $ne: req.user._id } } },
      { $project: { interests: 1 } }
    ]);

    // Flatten and count interests
    const interestCounts = {};
    similarUsers.forEach(u => {
      u.interests?.forEach(interest => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    });

    // Sort by popularity and filter out user's own interests
    const commonInterests = Object.entries(interestCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .filter(i => !currentUser.interests.includes(i))
      .slice(0, 10);

    res.status(200).json(commonInterests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/*
    if swiped left weinitiate a chat
    and create the conversation instantly

*/
export const recordSwipe = async (req, res) => {
  try {
    const { swipeeId, action } = req.body; 
    const currentUserId = req.user._id;

    if (!['passed', 'initiated_chat'].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'passed' or 'initiated_chat'" });
    }

    let interaction = await Interaction.findOne({ swiper: currentUserId, swipee: swipeeId });
    
    if (!interaction) {
      interaction = new Interaction({
        swiper: currentUserId,
        swipee: swipeeId,
        action: action
      });
      await interaction.save();
    }

    if (action === 'initiated_chat') {
       let conversation = await Conversation.findOne({
         isAnonymous: false,
         $and: [
           { participants: { $elemMatch: { $eq: currentUserId } } },
           { participants: { $elemMatch: { $eq: swipeeId } } },
         ],
       });

       if (!conversation) {
         conversation = new Conversation({
           participants: [currentUserId, swipeeId],
           isInstantMatch: false, 
           isAnonymous: false
         });
         await conversation.save();
       }

       // Tell frontend it was a match so they can redirect the user
       return res.status(200).json({ 
         message: "Chat initiated!", 
         match: true, 
         conversationId: conversation._id 
       });
    }

    res.status(200).json({ message: "Swiped successfully.", match: false });

  } catch (error) {
    // 11000 is the MongoDB error code for "duplicate key". 
    // This catches if the frontend accidentally sends the same swipe twice.
    if (error.code === 11000) {
        return res.status(400).json({ message: "You already swiped on this user." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};