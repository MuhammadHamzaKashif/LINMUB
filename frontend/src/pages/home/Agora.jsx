import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { ThoughtSkeleton } from '../../components/Skeletons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, Send, User, UserCheck, MessageCircle, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Agora = () => {
    const [thoughts, setThoughts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const { user } = useAuth();

    const fetchThoughts = async () => {
        try {
            const response = await api.get('/thoughts?limit=20');
            setThoughts(response.data.thoughts);
        } catch (error) {
            toast.error('Failed to load thoughts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThoughts();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsPosting(true);
        try {
            const response = await api.post('/thoughts', { content, isAnonymous });
            setThoughts([response.data.thought, ...thoughts]);
            setContent('');
            toast.success('Your thought has been shared');
        } catch (error) {
            toast.error('Failed to post thought');
        } finally {
            setIsPosting(false);
        }
    };

    const handleResonate = async (id) => {
        try {
            await api.put(`/thoughts/${id}/resonate`);
            setThoughts(thoughts.map(t => {
                if (t._id === id) {
                    const isMe = user._id;
                    const hasLiked = t.resonates.includes(isMe);
                    return {
                        ...t,
                        resonates: hasLiked
                            ? t.resonates.filter(uid => uid !== isMe)
                            : [...t.resonates, isMe]
                    };
                }
                return t;
            }));
        } catch (error) {
            toast.error('Failed to resonance');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Post Thought Box */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <form onSubmit={handlePost}>
                        <textarea
                            className="w-full bg-transparent border-none resize-none focus:ring-0 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[100px]"
                            placeholder="What's on your mind? (Keep it calm...)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isAnonymous}
                                            onChange={() => setIsAnonymous(!isAnonymous)}
                                        />
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Post Anonymously</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={isPosting || !content.trim()}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {isPosting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Send className="w-4 h-4" />}
                                <span>Post</span>
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Feed */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [...Array(3)].map((_, i) => <ThoughtSkeleton key={i} />)
                        ) : (
                            thoughts.map((thought) => (
                                <motion.div
                                    key={thought._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-6 hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                                                {thought.isAnonymous ? (
                                                    <Shield className="w-5 h-5 text-slate-400" />
                                                ) : (
                                                    <span className="font-bold text-primary-600">{thought.author?.username?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                                        {thought.isAnonymous ? 'Anonymous' : thought.author?.username}
                                                    </h3>
                                                    {!thought.isAnonymous && (
                                                        <span className="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full uppercase tracking-wider font-bold">
                                                            {thought.author?.socializingCapability}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 italic">
                                                    {new Date(thought.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {thought.content}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between text-slate-400">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => handleResonate(thought._id)}
                                                className={`flex items-center gap-2 transition-all active:scale-125 ${thought.resonates?.includes(user?._id) ? 'text-red-500' : 'hover:text-red-400'
                                                    }`}
                                            >
                                                <Heart className={`w-5 h-5 ${thought.resonates?.includes(user?._id) ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-medium">{thought.resonates?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-primary-500 transition-colors">
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="text-sm font-medium">0</span>
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">RESONATE IN SILENCE</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
};

// Internal Shield icon for anonymous since I forgot to import it previously in this chunk
const Shield = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
);

export default Agora;
