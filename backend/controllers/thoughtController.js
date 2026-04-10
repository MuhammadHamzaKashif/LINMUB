import Thought from '../models/Thought.js';

/*
    - uh ts just creates a new post and adds it to thoughts table 
*/
export const createThought = async (req, res) => {
  try {
    const { content, isAnonymous, media } = req.body;

    const newThought = new Thought({
      author: req.user._id, 
      content,
      isAnonymous: isAnonymous !== undefined ? isAnonymous : true, // by default its true
      media: media || [] 
    });

    await newThought.save();

    res.status(201).json({
      message: "Thought floated successfully!",
      thought: newThought
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/*
    Func to get thots
    - get page no and no of thots per page
    - calc from which to which thots we need
    - get these thoughts from db from newest
    - replace userid with data which we'll need and sned
*/
export const getThoughtFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const thoughts = await Thought.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username socializingCapability isVisible');

    const totalThoughts = await Thought.countDocuments();

    res.status(200).json({ 
      thoughts,
      currentPage: page,
      totalPages: Math.ceil(totalThoughts / limit),
      hasMore: page * limit < totalThoughts // boolean telling frontend if more posts available
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/*
    Func to like a thot
    - search if thot exists
    - if alrdy liked unlike

*/
export const resonateThought = async (req, res) => {
  try {
    const thoughtId = req.params.id;
    const userId = req.user._id;

    const thought = await Thought.findById(thoughtId);
    if (!thought) {
      return res.status(404).json({ message: "Thought not found" });
    }

    const hasResonated = thought.resonates.includes(userId);

    if (hasResonated) {
      thought.resonates = thought.resonates.filter(id => id.toString() !== userId.toString());
    } else {
      thought.resonates.push(userId);
    }

    await thought.save();

    res.status(200).json({ 
      message: hasResonated ? "Resonance removed" : "Resonated successfully", 
      resonatesCount: thought.resonates.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};