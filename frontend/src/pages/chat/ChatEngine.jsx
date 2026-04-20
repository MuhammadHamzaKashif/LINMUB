import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { ChatSkeleton } from '../../components/Skeletons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Send, ChevronLeft, Loader2, Inbox, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatEngine = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [content, setContent] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat');
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to load chats');
        }
    };

    const fetchMessages = async () => {
        if (!conversationId) return;
        try {
            const response = await api.get(`/chat/${conversationId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (conversationId) {
            setLoading(true);
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [conversationId]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim() || !conversationId) return;
        setSending(true);
        try {
            const response = await api.post('/chat/message', {
                content,
                conversationId
            });
            setMessages([...messages, response.data]);
            setContent('');
            scrollToBottom();
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <Layout>
            <div className="flex glass-card overflow-hidden h-[calc(100vh-10rem)]">
                {/* Left Pane: Inbox */}
                <div className={`w-full md:w-80 border-r border-white/[0.06] flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-white/[0.06]">
                        <h2 className="text-xl font-outfit font-bold flex items-center gap-2 text-white">
                            <Inbox className="w-5 h-5 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                            Inbox
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length > 0 ? (
                            conversations.map((chat) => {
                                const otherUser = chat.participants.find(p => p._id !== currentUser?._id);
                                return (
                                    <button
                                        key={chat._id}
                                        onClick={() => navigate(`/chat/${chat._id}`)}
                                        className={`w-full flex items-center gap-3 p-4 transition-all border-l-2 ${
                                            conversationId === chat._id 
                                                ? 'bg-primary-600/10 border-primary-500 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)]' 
                                                : 'border-transparent hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-600/20 border border-white/[0.08] flex items-center justify-center text-primary-300 font-bold shrink-0 text-sm">
                                            {otherUser?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-slate-200 truncate text-sm">{otherUser?.username}</p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {chat.lastMessage?.content || 'Started a conversation'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center">
                                <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No conversations yet</p>
                                <button
                                    onClick={() => navigate('/stack')}
                                    className="mt-4 text-xs text-primary-400 font-bold hover:underline"
                                >
                                    Go to Stack to connect
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Chat Window */}
                <div className={`flex-1 flex flex-col overflow-hidden ${!conversationId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                    {!conversationId ? (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-primary-600/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
                                <MessageSquare className="w-10 h-10 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-outfit font-bold text-white">Select a conversation</h3>
                            <p className="text-slate-500 max-w-xs mt-2 text-sm">Pick a chat from the left or discover new people in the stack.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.02]">
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-600/20 border border-primary-500/20 flex items-center justify-center font-bold text-primary-300 text-sm">
                                    {conversations.find(c => c._id === conversationId)?.participants.find(p => p._id !== currentUser?._id)?.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-sm">
                                        {conversations.find(c => c._id === conversationId)?.participants.find(p => p._id !== currentUser?._id)?.username}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)]"></div>
                                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Active Room</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loading ? (
                                    <ChatSkeleton />
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, i) => {
                                            const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id || msg.sender?.id;
                                            const myId = currentUser?._id || currentUser?.id;
                                            const isMe = senderId === myId;
                                            return (
                                                <motion.div
                                                    key={msg._id || i}
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[80%] p-4 rounded-2xl ${isMe
                                                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-sm shadow-lg shadow-primary-900/30'
                                                            : 'bg-white/[0.06] border border-white/[0.08] text-slate-200 rounded-bl-sm'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        <span className={`text-[9px] block mt-2 ${isMe ? 'text-right text-white/40' : 'text-left text-slate-500'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
                                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a thoughtful message..."
                                        className="flex-1 input-field pr-12 h-12"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !content.trim()}
                                        className="absolute right-2 p-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-500 hover:to-primary-400 disabled:opacity-30 transition-all shadow-lg shadow-primary-900/30"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                                <p className="text-[9px] text-center text-slate-600 mt-2 uppercase tracking-[0.1em]">Enter to silence your frequency and send</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ChatEngine;
