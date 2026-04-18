import User from '../models/User.js';
import { generateEmbedding } from '../utils/aiEngine.js';

/*
    - get all profile fields
    - if interests are updated, regenerate embeddings
    - update user in db
*/
export const updateProfile = async (req, res) => {
  try {
    const { bio, age, gender, interests, socializingCapability, isVisible } = req.body;
    const userId = req.user._id;

    const updateData = {
      bio,
      age,
      gender,
      socializingCapability,
      isVisible
    };

    // Only update interests if provided
    if (interests && Array.isArray(interests)) {
      if (interests.length < 3 || interests.length > 10) {
        return res.status(400).json({ message: "Please provide between 3 and 10 interests for optimal matching." });
      }
      
      updateData.interests = interests;
      
      // Regenerate embedding for AI matching
      const interestString = `I am interested in ${interests.join(", ")}.`;
      try {
        const vector = await generateEmbedding(interestString);
        updateData.interestEmbedding = vector;
      } catch (aiError) {
        console.error("AI Embedding failed, continuing without vector update:", aiError);
        // We continue even if AI fails, just without updating the vector
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};