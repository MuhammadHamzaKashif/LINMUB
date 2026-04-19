import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Users,
    Calendar,
    Plus,
    ChevronRight,
    ShieldAlert,
    MapPin,
    Clock,
    Ghost,
    Loader2,
    MessageSquare,
    Settings,
    Check,
    X,
    Crown,
    Send,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'chat', 'admin'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [tempUsername, setTempUsername] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuggestModal, setShowSuggestModal] = useState(false);

    // Chat State
    const [groupConversation, setGroupConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Admin State & Member List
    const [pendingEvents, setPendingEvents] = useState([]);
    const [communityMembers, setCommunityMembers] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
 
    // Mentions State
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(0);

    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        niche: '',
        temporaryUsername: ''
    });
    const [suggestForm, setSuggestForm] = useState({
        title: '',
        description: '',
        scheduledDate: '',
        time: '',
        locationOrLink: ''
    });
    const [creating, setCreating] = useState(false);

    const { user } = useAuth();

    const renderMessageContent = (content) => {
        if (!content) return null;
        
        // Build a regex that matches any of the known aliases in this community
        // We sort by length descending to match longer aliases first (e.g., "@Hamza Kashif" before "@Hamza")
        const aliases = communityMembers
            .map(m => m.temporaryUsername)
            .filter(Boolean)
            .sort((a, b) => b.length - a.length);

        if (aliases.length === 0) return content;

        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = `@(${aliases.map(a => escapeRegExp(a)).join('|')})`;
        const regex = new RegExp(pattern, 'g');

        const parts = content.split(regex);
        return parts.map((part, i) => {
            if (aliases.includes(part)) {
                return (
                    <span 
                        key={i} 
                        className="px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold"
                    >
                        @{part}
                    </span>
                );
            }
            return part;
        });
    };

    const fetchCommunities = async () => {
        try {
            const response = await api.get('/communities');
            setCommunities(response.data);
        } catch (error) {
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async (communityId) => {
        try {
            const response = await api.get(`/communities/${communityId}/events`);
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to load events');
        }
    };

    const fetchGroupChat = async (communityId) => {
        setChatLoading(true);
        try {
            const resp = await api.get(`/chat/community/${communityId}`);
            setGroupConversation(resp.data);
            const msgResp = await api.get(`/chat/${resp.data._id}/messages`);
            setMessages(msgResp.data);
        } catch (error) {
            console.error('Failed to load chat');
        } finally {
            setChatLoading(false);
        }
    };

    const fetchAdminData = async (communityId) => {
        setAdminLoading(true);
        try {
            const eventResp = await api.get(`/communities/${communityId}/events/pending`);
            setPendingEvents(eventResp.data);
            const memberResp = await api.get(`/communities/${communityId}/members`);
            setCommunityMembers(memberResp.data);
        } catch (error) {
            console.error('Failed to load admin data');
        } finally {
            setAdminLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleCommunitySelect = (community) => {
        setSelectedCommunity(community);
        setActiveTab('overview');
        fetchEvents(community._id);
    };

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        if (tab === 'chat') {
            fetchGroupChat(selectedCommunity._id);
            // Fetch members even for non-admins to support mentions
            try {
                const memberResp = await api.get(`/communities/${selectedCommunity._id}/members`);
                setCommunityMembers(memberResp.data);
            } catch (err) { console.error("Could not load members for mentions"); }
        }
        if (tab === 'admin') fetchAdminData(selectedCommunity._id);
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!tempUsername.trim()) return;
        setJoining(true);
        try {
            await api.post(`/communities/${selectedCommunity._id}/join`, {
                temporaryUsername: tempUsername
            });
            toast.success(`Joined ${selectedCommunity.name} as ${tempUsername}`);
            setShowJoinModal(false);
            setTempUsername('');
            fetchCommunities();
            const updated = communities.find(c => c._id === selectedCommunity._id);
            setSelectedCommunity({ ...selectedCommunity, userRole: 'member', myAlias: tempUsername });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join community');
        } finally {
            setJoining(false);
        }
    };

    const handleNewMessageChange = (e) => {
        const val = e.target.value;
        setNewMessage(val);
 
        // Logic for mentions
        const lastChar = val[e.target.selectionStart - 1];
        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursorPosition);
        const lastWordMatch = textBeforeCursor.match(/@(\w*)$/);
 
        if (lastWordMatch) {
            setMentionSearch(lastWordMatch[1]);
            setShowMentions(true);
            setMentionIndex(0);
        } else {
            setShowMentions(false);
        }
    };
 
    const handleSelectMention = (alias) => {
        const cursorPosition = newMessage.lastIndexOf('@');
        const textBefore = newMessage.slice(0, cursorPosition);
        const textAfter = newMessage.slice(cursorPosition).replace(/^@\w*/, `@${alias} `);
        setNewMessage(textBefore + textAfter);
        setShowMentions(false);
    };

    const handleKeyDown = (e) => {
        if (!showMentions) return;

        const filtered = communityMembers.filter(m => 
            m.temporaryUsername.toLowerCase().includes(mentionSearch.toLowerCase())
        );

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter' && filtered.length > 0) {
            e.preventDefault();
            handleSelectMention(filtered[mentionIndex].temporaryUsername);
        } else if (e.key === 'Escape') {
            setShowMentions(false);
        }
    };
 
    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/communities', createForm);
            toast.success(`Community "${createForm.name}" created!`);
            setShowCreateModal(false);
            setCreateForm({ name: '', description: '', niche: '', temporaryUsername: '' });
            fetchCommunities();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create community');
        } finally {
            setCreating(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !groupConversation) return;

        const tmpMsg = {
            _id: Date.now(),
            sender: { _id: user._id, username: user.username },
            senderAlias: selectedCommunity.myAlias,
            content: newMessage,
            createdAt: new Date().toISOString()
        };
        setMessages([...messages, tmpMsg]);
        setNewMessage('');

        try {
            await api.post('/chat/message', {
                content: tmpMsg.content,
                conversationId: groupConversation._id
            });
        } catch (error) {
            toast.error('Failed to send message');
            setMessages(messages.filter(m => m._id !== tmpMsg._id));
        }
    };

    const handleSuggestEvent = async (e) => {
        e.preventDefault();
        try {
            const resp = await api.post(`/communities/${selectedCommunity._id}/events`, suggestForm);
            toast.success(resp.data.message);
            setShowSuggestModal(false);
            setSuggestForm({ title: '', description: '', scheduledDate: '', time: '', locationOrLink: '' });
            fetchEvents(selectedCommunity._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to suggest event');
        }
    };

    const handleUpdateEventStatus = async (eventId, status) => {
        try {
            await api.put(`/communities/${selectedCommunity._id}/events/${eventId}/status`, { status });
            toast.success(`Event ${status}`);
            fetchAdminData(selectedCommunity._id);
            fetchEvents(selectedCommunity._id);
        } catch (error) {
            toast.error('Failed to update event status');
        }
    };

    const handlePromote = async (memberUserId) => {
        try {
            await api.put(`/communities/${selectedCommunity._id}/promote/${memberUserId}`);
            toast.success('Member promoted to Admin');
            fetchAdminData(selectedCommunity._id);
        } catch (error) {
            toast.error('Failed to promote member');
        }
    };

    return (
        <Layout>
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-outfit font-bold text-slate-900 dark:text-white">Communities</h1>
                        <p className="text-slate-500 mt-1">Safe spaces for collective solitude</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!selectedCommunity && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary flex items-center gap-2 px-4 py-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Community</span>
                            </button>
                        )}
                        {selectedCommunity && (
                            <button
                                onClick={() => setSelectedCommunity(null)}
                                className="text-sm text-primary-600 font-bold flex items-center gap-1 hover:underline"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Back to all communities
                            </button>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {!selectedCommunity ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="glass-card p-6 h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
                                ))
                            ) : (
                                communities.map((community) => (
                                    <div
                                        key={community._id}
                                        onClick={() => handleCommunitySelect(community)}
                                        className="glass-card p-6 cursor-pointer group hover:border-primary-300 dark:hover:border-primary-800 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-widest">
                                                    {community.membersCount || 0} Members
                                                </span>
                                                {community.userRole && (
                                                    <span className="text-[9px] mt-1 font-bold text-primary-500 uppercase">{community.userRole}</span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{community.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm italic">
                                            {community.description || 'A community where silence is golden and presence is enough.'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-8 border-primary-100 dark:border-primary-900 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="max-w-xl">
                                        <h2 className="text-4xl font-outfit font-bold mb-4">{selectedCommunity.name}</h2>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                            {selectedCommunity.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                                <Users className="w-4 h-4" />
                                                <span>{selectedCommunity.niche || 'General'}</span>
                                            </div>
                                            {selectedCommunity.userRole && (
                                                <div className="flex items-center gap-2 text-sm text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full font-bold">
                                                    <Crown className="w-4 h-4" />
                                                    <span className="capitalize">{selectedCommunity.userRole}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        {!selectedCommunity.userRole ? (
                                            <button
                                                onClick={() => setShowJoinModal(true)}
                                                className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
                                            >
                                                <Ghost className="w-5 h-5" />
                                                Join with Alias
                                            </button>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Your Alias</p>
                                                <p className="text-xl font-outfit font-bold text-primary-600 dark:text-primary-400">@{selectedCommunity.myAlias}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => handleTabChange('overview')}
                                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}
                                >
                                    Overview
                                </button>
                                {selectedCommunity.userRole && (
                                    <button
                                        onClick={() => handleTabChange('chat')}
                                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'chat' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}
                                    >
                                        Group Chat
                                    </button>
                                )}
                                {selectedCommunity.userRole === 'admin' && (
                                    <button
                                        onClick={() => handleTabChange('admin')}
                                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'admin' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}
                                    >
                                        Management
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[400px]">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-4">
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Calendar className="w-5 h-5 text-primary-500" />
                                                    Upcoming Events
                                                </h3>
                                                {selectedCommunity.userRole && (
                                                    <button
                                                        onClick={() => setShowSuggestModal(true)}
                                                        className="btn-secondary text-xs flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Suggest Event
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {events.length > 0 ? (
                                                    events.map((event) => (
                                                        <div key={event._id} className="glass-card p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow">
                                                            <div className="space-y-3">
                                                                <h4 className="text-lg font-bold">{event.title}</h4>
                                                                <p className="text-slate-500 text-sm italic">{event.description}</p>
                                                                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <MapPin className="w-3.5 h-3.5 text-primary-400" />
                                                                        {event.locationOrLink}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3.5 h-3.5 text-primary-400" />
                                                                        {new Date(event.scheduledDate).toLocaleDateString()} {event.time && `at ${event.time}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <button className="w-full md:w-auto px-6 py-2 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-bold text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                                                    RSVP Silently
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="glass-card p-12 text-center border-dashed border-2">
                                                        <p className="text-slate-400">No scheduled events in this community. Yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}

                                {activeTab === 'chat' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px] glass-card overflow-hidden">
                                        {chatLoading ? (
                                            <div className="flex-1 flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                                    {messages.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                                                            <MessageSquare className="w-12 h-12 opacity-20" />
                                                            <p>Start a quiet conversation...</p>
                                                        </div>
                                                    ) : (
                                                        messages.map((msg) => (
                                                            <div key={msg._id} className={`flex flex-col ${msg.sender?._id === user._id ? 'items-end' : 'items-start'}`}>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.senderAlias}</span>
                                                                </div>
                                                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender?._id === user._id ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'}`}>
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
                                                                </div>
                                                                <span className="text-[9px] mt-1 text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                    <div ref={chatEndRef} />
                                                </div>
                                                
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative">
                                                    {/* Mentions Overlay */}
                                                    <AnimatePresence>
                                                        {showMentions && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute bottom-full left-4 mb-2 w-64 glass-card shadow-2xl overflow-hidden z-20 border-primary-500/20"
                                                            >
                                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                                                    <p className="text-[10px] font-bold uppercase text-slate-400">Mention Community Member</p>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {communityMembers
                                                                        .filter(m => m.temporaryUsername.toLowerCase().includes(mentionSearch.toLowerCase()))
                                                                        .map((m, idx) => (
                                                                            <button
                                                                                key={m.temporaryUsername}
                                                                                onClick={() => handleSelectMention(m.temporaryUsername)}
                                                                                className={`w-full text-left p-3 text-sm flex items-center gap-3 transition-colors ${mentionIndex === idx ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                                                            >
                                                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                                                    <Ghost className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className="font-bold">@{m.temporaryUsername}</span>
                                                                                {m.role === 'admin' && <Crown className="w-3 h-3 text-amber-500" />}
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-2"
                                                            placeholder={`Message as @${selectedCommunity.myAlias}... (use @ to tag)`}
                                                            value={newMessage}
                                                            onChange={handleNewMessageChange}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                        <button type="submit" className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center">
                                                            <Send className="w-5 h-5" />
                                                        </button>
                                                    </form>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'admin' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-4">
                                        <section>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-amber-500" />
                                                Pending Approvals
                                            </h3>
                                            <div className="space-y-3">
                                                {adminLoading ? (
                                                    <div className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                                                ) : pendingEvents.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed text-sm italic">
                                                        No events awaiting approval.
                                                    </div>
                                                ) : (
                                                    pendingEvents.map(event => (
                                                        <div key={event._id} className="glass-card p-4 flex items-center justify-between gap-4 border-amber-100 dark:border-amber-900/30">
                                                            <div>
                                                                <h4 className="font-bold">{event.title}</h4>
                                                                <p className="text-[10px] text-slate-400 uppercase font-medium">
                                                                  {new Date(event.scheduledDate).toLocaleDateString()} {event.time && `at ${event.time}`}
                                                                </p>
                                                                <p className="text-xs text-slate-500 italic">Suggested by {event.organizerAlias}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateEventStatus(event._id, 'approved')}
                                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateEventStatus(event._id, 'rejected')}
                                                                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Users className="w-5 h-5 text-primary-500" />
                                                Manage Sanctuary Members
                                            </h3>
                                            <div className="glass-card divide-y dark:divide-slate-800 overflow-hidden">
                                                {communityMembers.map(member => (
                                                    <div key={member.user?._id} className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                                {member.role === 'admin' ? <Crown className="w-5 h-5 text-amber-500" /> : <Ghost className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">@{member.temporaryUsername}</p>
                                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{member.role}</p>
                                                            </div>
                                                        </div>
                                                        {member.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handlePromote(member.user._id)}
                                                                className="text-[10px] font-bold text-primary-600 uppercase hover:underline"
                                                            >
                                                                Promote
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Community Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                                className="glass-card w-full max-w-xl p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <h3 className="text-3xl font-outfit font-bold mb-2">Create a New Room</h3>
                                <p className="text-slate-500 text-sm mb-8 italic">Seed a new space where introverts can coexist in quiet harmony.</p>

                                <form onSubmit={handleCreateCommunity} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 md:col-span-2">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Community Name</label>
                                            <input
                                                type="text"
                                                className="input-field py-3"
                                                placeholder="e.g. Midnight Library"
                                                value={createForm.name}
                                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Niche/Category</label>
                                        <input type="text" className="input-field" placeholder="e.g. Readers" value={createForm.niche} onChange={(e) => setCreateForm({ ...createForm, niche: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Founder Alias</label>
                                        <input type="text" className="input-field" placeholder="Your name in this room" value={createForm.temporaryUsername} onChange={(e) => setCreateForm({ ...createForm, temporaryUsername: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                                        <textarea className="input-field min-h-[100px] py-3" placeholder="What is this space for?" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-4 mt-4">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                                        <button type="submit" disabled={creating} className="flex-[2] btn-primary py-3 flex items-center justify-center gap-3 text-lg">
                                            {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5" /><span>Establish Sanctuary</span></>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Suggest Event Modal */}
                <AnimatePresence>
                    {showSuggestModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-8">
                                <h3 className="text-2xl font-outfit font-bold mb-4">Suggest an Event</h3>
                                <form onSubmit={handleSuggestEvent} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Title</label>
                                        <input type="text" className="input-field" placeholder="Event name" value={suggestForm.title} onChange={(e) => setSuggestForm({ ...suggestForm, title: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                                        <input type="date" className="input-field" value={suggestForm.scheduledDate} onChange={(e) => setSuggestForm({ ...suggestForm, scheduledDate: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Time</label>
                                        <input type="time" className="input-field" value={suggestForm.time} onChange={(e) => setSuggestForm({ ...suggestForm, time: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Location or Link</label>
                                        <input type="text" className="input-field" placeholder="Where is it?" value={suggestForm.locationOrLink} onChange={(e) => setSuggestForm({ ...suggestForm, locationOrLink: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                                        <textarea className="input-field py-2" rows="3" placeholder="Briefly describe the activity" value={suggestForm.description} onChange={(e) => setSuggestForm({ ...suggestForm, description: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowSuggestModal(false)} className="flex-1 btn-secondary py-2">Cancel</button>
                                        <button type="submit" className="flex-[2] btn-primary py-2 font-bold">Submit Suggestion</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Join Modal */}
                <AnimatePresence>
                    {showJoinModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-8">
                                <h3 className="text-2xl font-outfit font-bold mb-2">Join Anonymously</h3>
                                <p className="text-slate-500 text-sm mb-6">Choose a temporary alias for this community.</p>
                                <form onSubmit={handleJoin} className="space-y-6">
                                    <input type="text" className="input-field" placeholder="e.g. SilentForest77" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} required autoFocus />
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                        <button type="submit" disabled={joining} className="flex-1 btn-primary flex items-center justify-center gap-2">
                                            {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Room'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Communities;
