import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { ChatSkeleton } from '../../components/Skeletons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Send, User, ChevronLeft, Loader2, Sparkles, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

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
        const interval = setInterval(fetchConversations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (conversationId) {
            setLoading(true);
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll more frequently for active chat
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
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden h-[calc(100vh-10rem)] shadow-sm">
                {/* Left Pane: Inbox (hidden on pulse mobile if chat is open) */}
                <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-outfit font-bold flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-primary-500" />
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
                                        className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-l-4 ${conversationId === chat._id ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-500' : 'border-transparent'
                                            }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                            {otherUser?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{otherUser?.username}</p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {chat.lastMessage?.content || 'Started a conversation'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm text-slate-400">No conversations yet</p>
                                <button
                                    onClick={() => navigate('/stack')}
                                    className="mt-4 text-xs text-primary-600 font-bold hover:underline"
                                >
                                    Go to Stack to connect
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Chat Window */}
                <div className={`flex-1 flex flex-col overflow-hidden ${!conversationId ? 'hidden md:flex items-center justify-center bg-slate-50 dark:bg-slate-900/50' : 'flex bg-white dark:bg-slate-900'}`}>
                    {!conversationId ? (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-xl font-outfit font-bold text-slate-900 dark:text-white">Select a conversation</h3>
                            <p className="text-slate-500 max-w-xs mt-2">Pick a chat from the left or discover new people in the stack.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-700">
                                    {conversations.find(c => c._id === conversationId)?.participants.find(p => p._id !== currentUser?._id)?.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        {conversations.find(c => c._id === conversationId)?.participants.find(p => p._id !== currentUser?._id)?.username}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Active Room</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                                                    <div className={`max-w-[80%] p-4 rounded-3xl ${isMe
                                                            ? 'bg-primary-600 text-white rounded-br-none'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        <span className={`text-[10px] block mt-2 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
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
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
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
                                        className="absolute right-2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                                <p className="text-[10px] text-center text-slate-400 mt-2 uppercase tracking-tighter">Enter to silence your frequency and send</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ChatEngine;
