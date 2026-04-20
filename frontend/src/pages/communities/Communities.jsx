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
    MapPin,
    Clock,
    Ghost,
    Loader2,
    MessageSquare,
    Check,
    X,
    Crown,
    Send,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
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
                        className="px-2 py-0.5 rounded-lg bg-primary-600/20 text-primary-300 font-bold border border-primary-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
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
                        <h1 className="text-3xl font-outfit font-bold text-white">
                            {selectedCommunity ? selectedCommunity.name : <><span className="gradient-text">Sanctuaries</span></>}
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            {selectedCommunity ? selectedCommunity.description?.slice(0, 60) : 'Safe spaces for collective solitude'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {!selectedCommunity && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary flex items-center gap-2 px-5 py-2.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Create Sanctuary</span>
                            </button>
                        )}
                        {selectedCommunity && (
                            <button
                                onClick={() => setSelectedCommunity(null)}
                                className="text-sm text-primary-400 font-bold flex items-center gap-1 hover:text-primary-300 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                                Back to all
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
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="glass-card p-6 h-48 animate-pulse">
                                        <div className="h-10 w-10 rounded-2xl bg-white/[0.06] mb-4"></div>
                                        <div className="h-5 bg-white/[0.06] rounded-full w-2/3 mb-3"></div>
                                        <div className="h-3 bg-white/[0.04] rounded-full w-full mb-2"></div>
                                        <div className="h-3 bg-white/[0.04] rounded-full w-3/4"></div>
                                    </div>
                                ))
                            ) : (
                                communities.map((community) => (
                                    <div
                                        key={community._id}
                                        onClick={() => handleCommunitySelect(community)}
                                        className="glass-card-hover p-6 cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-500/[0.06] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[9px] font-bold px-2.5 py-1 bg-white/[0.06] text-slate-400 rounded-full uppercase tracking-[0.15em] border border-white/[0.06]">
                                                        {community.membersCount || 0} Members
                                                    </span>
                                                    {community.userRole && (
                                                        <span className="text-[9px] font-bold text-primary-400 uppercase tracking-wider">{community.userRole}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary-300 transition-colors">{community.name}</h3>
                                            <p className="text-slate-500 line-clamp-2 text-sm italic">
                                                {community.description || 'A community where silence is golden and presence is enough.'}
                                            </p>
                                        </div>
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
                            {/* Community Header */}
                            <div className="glass-card p-8 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-transparent to-purple-600/5 pointer-events-none"></div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/[0.08] rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="max-w-xl">
                                        <h2 className="text-3xl font-outfit font-bold text-white mb-3">{selectedCommunity.name}</h2>
                                        <p className="text-slate-400 leading-relaxed mb-5 text-sm">
                                            {selectedCommunity.description}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">
                                                <Users className="w-3.5 h-3.5 text-primary-400" />
                                                <span>{selectedCommunity.niche || 'General'}</span>
                                            </div>
                                            {selectedCommunity.userRole && (
                                                <div className="flex items-center gap-2 text-xs text-primary-300 bg-primary-500/10 px-3 py-1.5 rounded-full font-bold border border-primary-500/20">
                                                    <Crown className="w-3.5 h-3.5" />
                                                    <span className="capitalize">{selectedCommunity.userRole}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        {!selectedCommunity.userRole ? (
                                            <button
                                                onClick={() => setShowJoinModal(true)}
                                                className="btn-primary px-8 py-3 text-base flex items-center gap-2"
                                            >
                                                <Ghost className="w-5 h-5" />
                                                Join with Alias
                                            </button>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Your Alias</p>
                                                <p className="text-2xl font-outfit font-black gradient-text drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">@{selectedCommunity.myAlias}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex items-center gap-1 border-b border-white/[0.06]">
                                <button
                                    onClick={() => handleTabChange('overview')}
                                    className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                >
                                    Overview
                                </button>
                                {selectedCommunity.userRole && (
                                    <button
                                        onClick={() => handleTabChange('chat')}
                                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'chat' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Group Chat
                                    </button>
                                )}
                                {selectedCommunity.userRole === 'admin' && (
                                    <button
                                        onClick={() => handleTabChange('admin')}
                                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'admin' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Management
                                    </button>
                                )}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[400px]">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-2">
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                                    <Calendar className="w-5 h-5 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                                                    Upcoming Events
                                                </h3>
                                                {selectedCommunity.userRole && (
                                                    <button
                                                        onClick={() => setShowSuggestModal(true)}
                                                        className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        Suggest Event
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                {events.length > 0 ? (
                                                    events.map((event) => (
                                                        <div key={event._id} className="glass-card-hover p-6 flex flex-col md:flex-row justify-between gap-6">
                                                            <div className="space-y-3">
                                                                <h4 className="text-base font-bold text-white">{event.title}</h4>
                                                                <p className="text-slate-500 text-sm italic">{event.description}</p>
                                                                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <MapPin className="w-3 h-3 text-primary-400" />
                                                                        {event.locationOrLink}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock className="w-3 h-3 text-primary-400" />
                                                                        {new Date(event.scheduledDate).toLocaleDateString()} {event.time && `at ${event.time}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <button className="w-full md:w-auto px-6 py-2 rounded-xl border border-primary-500/20 text-primary-400 font-bold text-sm hover:bg-primary-500/10 hover:border-primary-500/30 transition-all">
                                                                    RSVP Silently
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="glass-card p-12 text-center border-dashed border-white/10">
                                                        <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                                        <p className="text-slate-500 text-sm">No scheduled events in this community. Yet.</p>
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
                                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                    {messages.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                                                            <MessageSquare className="w-12 h-12 opacity-20" />
                                                            <p className="text-sm">Start a quiet conversation...</p>
                                                        </div>
                                                    ) : (
                                                        messages.map((msg) => (
                                                            <div key={msg._id} className={`flex flex-col ${msg.sender?._id === user._id ? 'items-end' : 'items-start'}`}>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{msg.senderAlias}</span>
                                                                </div>
                                                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender?._id === user._id
                                                                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-tr-sm shadow-lg shadow-primary-900/30'
                                                                    : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-tl-sm'
                                                                }`}>
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageContent(msg.content)}</p>
                                                                </div>
                                                                <span className="text-[9px] mt-1 text-slate-600">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                    <div ref={chatEndRef} />
                                                </div>
                                                
                                                <div className="p-4 border-t border-white/[0.06] bg-white/[0.02] relative">
                                                    {/* Mentions Overlay */}
                                                    <AnimatePresence>
                                                        {showMentions && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute bottom-full left-4 mb-2 w-64 glass-card shadow-2xl overflow-hidden z-20 border-primary-500/20"
                                                            >
                                                                <div className="p-2 bg-white/[0.04] border-b border-white/[0.06]">
                                                                    <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Mention Member</p>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {communityMembers
                                                                        .filter(m => m.temporaryUsername.toLowerCase().includes(mentionSearch.toLowerCase()))
                                                                        .map((m, idx) => (
                                                                            <button
                                                                                key={m.temporaryUsername}
                                                                                onClick={() => handleSelectMention(m.temporaryUsername)}
                                                                                className={`w-full text-left p-3 text-sm flex items-center gap-3 transition-colors ${
                                                                                    mentionIndex === idx 
                                                                                        ? 'bg-primary-500/15 text-primary-300' 
                                                                                        : 'hover:bg-white/[0.04] text-slate-400'
                                                                                }`}
                                                                            >
                                                                                <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                                                                                    <Ghost className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className="font-bold">@{m.temporaryUsername}</span>
                                                                                {m.role === 'admin' && <Crown className="w-3 h-3 text-amber-400" />}
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-1 input-field py-2.5"
                                                            placeholder={`Message as @${selectedCommunity.myAlias}... (use @ to tag)`}
                                                            value={newMessage}
                                                            onChange={handleNewMessageChange}
                                                            onKeyDown={handleKeyDown}
                                                        />
                                                        <button type="submit" className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-900/30">
                                                            <Send className="w-5 h-5" />
                                                        </button>
                                                    </form>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'admin' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-2">
                                        <section>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                                <Clock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                                                Pending Approvals
                                            </h3>
                                            <div className="space-y-3">
                                                {adminLoading ? (
                                                    <div className="h-20 animate-pulse glass-card"></div>
                                                ) : pendingEvents.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-500 glass-card border-dashed border-white/10 text-sm italic">
                                                        No events awaiting approval.
                                                    </div>
                                                ) : (
                                                    pendingEvents.map(event => (
                                                        <div key={event._id} className="glass-card p-4 flex items-center justify-between gap-4 border-amber-500/10">
                                                            <div>
                                                                <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                                                <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">
                                                                  {new Date(event.scheduledDate).toLocaleDateString()} {event.time && `at ${event.time}`}
                                                                </p>
                                                                <p className="text-xs text-slate-500 italic mt-0.5">Suggested by <span className="text-primary-400 font-semibold">{event.organizerAlias}</span></p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateEventStatus(event._id, 'approved')}
                                                                    className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateEventStatus(event._id, 'rejected')}
                                                                    className="p-2 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 transition-colors border border-rose-500/20"
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
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                                <Users className="w-5 h-5 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                                                Manage Members
                                            </h3>
                                            <div className="glass-card divide-y divide-white/[0.06] overflow-hidden">
                                                {communityMembers.map(member => (
                                                    <div key={member.user?._id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                                                                {member.role === 'admin' ? <Crown className="w-5 h-5 text-amber-400" /> : <Ghost className="w-5 h-5 text-slate-500" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-200">@{member.temporaryUsername}</p>
                                                                <p className="text-[9px] text-slate-500 uppercase tracking-[0.15em]">{member.role}</p>
                                                            </div>
                                                        </div>
                                                        {member.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handlePromote(member.user._id)}
                                                                className="text-[10px] font-bold text-primary-400 uppercase hover:text-primary-300 transition-colors tracking-wider"
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                                className="glass-card w-full max-w-xl p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <h3 className="text-2xl font-outfit font-bold mb-2 text-white">Create a <span className="gradient-text">New Sanctuary</span></h3>
                                <p className="text-slate-500 text-sm mb-8 italic">Seed a new space where introverts can coexist in quiet harmony.</p>

                                <form onSubmit={handleCreateCommunity} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
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
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Niche/Category</label>
                                        <input type="text" className="input-field py-3" placeholder="e.g. Readers" value={createForm.niche} onChange={(e) => setCreateForm({ ...createForm, niche: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Founder Alias</label>
                                        <input type="text" className="input-field py-3" placeholder="Your name in this room" value={createForm.temporaryUsername} onChange={(e) => setCreateForm({ ...createForm, temporaryUsername: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                                        <textarea className="input-field min-h-[100px] py-3" placeholder="What is this space for?" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-4 mt-2">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                                        <button type="submit" disabled={creating} className="flex-[2] btn-primary py-3 flex items-center justify-center gap-3 text-base">
                                            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /><span>Establish Sanctuary</span></>}
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-8">
                                <h3 className="text-xl font-outfit font-bold mb-5 text-white">Suggest an Event</h3>
                                <form onSubmit={handleSuggestEvent} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Title</label>
                                        <input type="text" className="input-field py-2.5" placeholder="Event name" value={suggestForm.title} onChange={(e) => setSuggestForm({ ...suggestForm, title: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Date</label>
                                        <input type="date" className="input-field py-2.5" value={suggestForm.scheduledDate} onChange={(e) => setSuggestForm({ ...suggestForm, scheduledDate: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Time</label>
                                        <input type="time" className="input-field py-2.5" value={suggestForm.time} onChange={(e) => setSuggestForm({ ...suggestForm, time: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Location or Link</label>
                                        <input type="text" className="input-field py-2.5" placeholder="Where is it?" value={suggestForm.locationOrLink} onChange={(e) => setSuggestForm({ ...suggestForm, locationOrLink: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Description</label>
                                        <textarea className="input-field py-2.5" rows="3" placeholder="Briefly describe the activity" value={suggestForm.description} onChange={(e) => setSuggestForm({ ...suggestForm, description: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowSuggestModal(false)} className="flex-1 btn-secondary py-2.5">Cancel</button>
                                        <button type="submit" className="flex-[2] btn-primary py-2.5 font-bold">Submit Suggestion</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Join Modal */}
                <AnimatePresence>
                    {showJoinModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card w-full max-w-md p-8">
                                <h3 className="text-xl font-outfit font-bold mb-2 text-white">Join <span className="gradient-text">Anonymously</span></h3>
                                <p className="text-slate-500 text-sm mb-6">Choose a temporary alias for this community.</p>
                                <form onSubmit={handleJoin} className="space-y-5">
                                    <input type="text" className="input-field py-3" placeholder="e.g. SilentForest77" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} required autoFocus />
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary py-2.5">Cancel</button>
                                        <button type="submit" disabled={joining} className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5">
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
