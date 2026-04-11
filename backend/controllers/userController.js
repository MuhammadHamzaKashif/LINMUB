import { generateEmbedding } from '../utils/aiEngine.js';

/*
    - get interets
    - make one string of them all
    - pass to embedding generation func
    - get embeddings and add to user and save
*/
export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    const interestString = `I am interested in ${interests.join(", ")}.`;

    const vector = await generateEmbedding(interestString);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        interests: interests,
        interestEmbedding: vector 
      },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated with embeddings", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};