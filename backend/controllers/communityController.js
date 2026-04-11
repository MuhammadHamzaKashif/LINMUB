import Community from '../models/Community.js';
import Event from '../models/Event.js';


export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().select('-members');
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createCommunity = async (req, res) => {
  try {
    const { name, description, niche, temporaryUsername } = req.body;

    const newCommunity = new Community({
      name,
      description,
      niche,
      members: [{
        user: req.user._id,
        temporaryUsername: temporaryUsername || "Founder",
        isIdentityRevealed: false
      }]
    });

    await newCommunity.save();
    res.status(201).json({ message: "Community created!", community: newCommunity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { temporaryUsername } = req.body; // alter-ayano-ego for this group. so tuff

    if (!temporaryUsername) {
      return res.status(400).json({ message: "You must provide a temporary username to join." });
    }

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const isAlreadyMember = community.members.some(member => member.user.toString() === req.user._id.toString());
    if (isAlreadyMember) {
      return res.status(400).json({ message: "You are already a member of this community." });
    }

    community.members.push({
      user: req.user._id,
      temporaryUsername,
      isIdentityRevealed: false
    });

    await community.save();
    res.status(200).json({ message: `Joined successfully as ${temporaryUsername}!` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const createEvent = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { title, description, scheduledDate, locationOrLink } = req.body;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const isMember = community.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: "You must join this community to schedule events." });
    }

    const newEvent = new Event({
      community: communityId,
      organizer: req.user._id,
      title,
      description,
      scheduledDate,
      locationOrLink
    });

    await newEvent.save();
    res.status(201).json({ message: "Event scheduled!", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCommunityEvents = async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const events = await Event.find({ community: communityId, scheduledDate: { $gte: new Date() } })
      .sort({ scheduledDate: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};