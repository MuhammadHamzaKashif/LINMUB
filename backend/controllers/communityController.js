import Community from '../models/Community.js';
import Event from '../models/Event.js';


export const getCommunities = async (req, res) => {
    try {
        const communities = await Community.aggregate([
            {
                $addFields: {
                    membersCount: { $size: "$members" },
                    userMembership: {
                        $filter: {
                            input: "$members",
                            as: "m",
                            cond: { $eq: ["$$m.user", req.user._id] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    userRole: { $arrayElemAt: ["$userMembership.role", 0] },
                    myAlias: { $arrayElemAt: ["$userMembership.temporaryUsername", 0] }
                }
            },
            {
                $project: {
                    members: 0,
                    userMembership: 0
                }
            }
        ]);
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
                isIdentityRevealed: false,
                role: 'admin'
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
            isIdentityRevealed: false,
            role: 'member'
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
        const { title, description, scheduledDate, time, locationOrLink } = req.body;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        const memberInfo = community.members.find(member => member.user.toString() === req.user._id.toString());
        if (!memberInfo) {
            return res.status(403).json({ message: "You must join this community to schedule events." });
        }

        // Admins' events are approved by default, others are pending
        const status = memberInfo.role === 'admin' ? 'approved' : 'pending';

        const newEvent = new Event({
            community: communityId,
            organizer: req.user._id,
            organizerAlias: memberInfo.temporaryUsername,
            title,
            description,
            scheduledDate,
            time,
            locationOrLink,
            status
        });

        await newEvent.save();
        res.status(201).json({
            message: status === 'approved' ? "Event scheduled!" : "Event suggested! Awaiting admin approval.",
            event: newEvent
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCommunityEvents = async (req, res) => {
    try {
        const { communityId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        // Only fetch approved events for the main list
        const events = await Event.find({
            community: communityId,
            scheduledDate: { $gte: today },
            status: 'approved'
        })
            .sort({ scheduledDate: 1 });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Admin Endpoints
export const getPendingEvents = async (req, res) => {
    try {
        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        const isAdmin = community.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');

        if (!isAdmin) return res.status(403).json({ message: "Admin access required" });
 
        const events = await Event.find({ community: communityId, status: 'pending' })
            .sort({ createdAt: -1 });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateEventStatus = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const community = await Community.findById(event.community);
        const isAdmin = community?.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');

        if (!isAdmin) return res.status(403).json({ message: "Admin access required" });

        event.status = status;
        await event.save();

        res.status(200).json({ message: `Event ${status} successfully`, event });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCommunityMembers = async (req, res) => {
    try {
        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        const memberInfo = community.members.find(m => m.user.toString() === req.user._id.toString());
        if (!memberInfo) return res.status(403).json({ message: "You must be a member of this community" });

        const isAdmin = memberInfo.role === 'admin';

        if (isAdmin) {
            // Admins get full population
            await community.populate('members.user', 'username email');
            return res.status(200).json(community.members);
        } else {
            // Regular members only see aliases and roles to support mentions
            const publicMembers = community.members.map(m => ({
                temporaryUsername: m.temporaryUsername,
                role: m.role
            }));
            return res.status(200).json(publicMembers);
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const promoteToAdmin = async (req, res) => {
    try {
        const { communityId, userIdToPromote } = req.params;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        const currentUserIsAdmin = community.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
        if (!currentUserIsAdmin) return res.status(403).json({ message: "Only admins can promote other members" });

        const memberToPromote = community.members.find(m => m.user.toString() === userIdToPromote);
        if (!memberToPromote) return res.status(404).json({ message: "Member not found in this community" });

        memberToPromote.role = 'admin';
        await community.save();

        res.status(200).json({ message: "Member promoted to Admin" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};