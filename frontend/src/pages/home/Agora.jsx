import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { ThoughtSkeleton } from '../../components/Skeletons';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    MoreHorizontal,
    Sparkles,
    Calendar,
    Users,
    Plus,
    Ghost,
    Clock,
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Agora = () => {
    const [thoughts, setThoughts] = useState([]);
    const [events, setEvents] = useState([]);
    const [commonGrounds, setCommonGrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedThoughtId, setSelectedThoughtId] = useState(null);

    const fetchData = async () => {
        setLoading(true);

        // 1. Fetch Thoughts (Independent)
        try {
            const thoughtsRes = await api.get('/thoughts?limit=30');
            let thoughtsData = thoughtsRes.data.thoughts || [];
            console.log(thoughtsData);

            if (thoughtsData.length === 0) {
                thoughtsData = [{
                    _id: 'seed-1',
                    content: 'Welcome to the Agora. Double-click a resonance to start a journey.',
                    isAnonymous: true,
                    resonates: []
                }];
            }

            const scatteredThoughts = thoughtsData.map((t, i) => {
                const cols = 5;
                const row = Math.floor(i / cols);
                const col = i % cols;

                return {
                    ...t,
                    pos: {
                        x: (col * 18) + (Math.random() * 12 + 4),
                        y: (row * 12) + (Math.random() * 8 + 4),
                        scale: 1.0 + Math.random() * 0.4,
                        color: ['#f468c0', '#3dadff', '#a855f7', '#ec4899', '#22d3ee'][Math.floor(Math.random() * 5)]
                    }
                };
            });
            setThoughts(scatteredThoughts);
        } catch (error) {
            console.error('Failed to load thoughts', error);
            // Fallback seed on hard failure
            setThoughts([{
                _id: 'err-seed',
                content: 'The stars are dim, but the resonance remains. Welcome back.',
                isAnonymous: true,
                pos: { x: 50, y: 30, scale: 1.5, color: '#3dadff' }
            }]);
        }

        // 2. Fetch Events (Independent)
        try {
            const eventsRes = await api.get('/communities/joined-events');
            setEvents(eventsRes.data || []);
        } catch (err) { console.error('Failed to load events', err); }

        // 3. Fetch Common Grounds (Independent)
        try {
            const commonRes = await api.get('/interactions/common-grounds');
            setCommonGrounds(commonRes.data || []);
        } catch (err) { console.error('Failed to load common grounds', err); }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsPosting(true);
        try {
            const response = await api.post('/thoughts', { content, isAnonymous: isAnonymous });
            const newThought = {
                ...response.data.thought,
                pos: {
                    x: 10 + Math.random() * 80,
                    y: 10 + Math.random() * 30,
                    scale: 1.3,
                    color: '#f468c0'
                }
            };
            setThoughts([newThought, ...thoughts]);
            setContent('');
            toast.success('Your thought has joined the Agora');
        } catch (error) {
            toast.error('Failed to post thought');
        } finally {
            setIsPosting(false);
        }
    };

    const handleResonate = async (id) => {
        try {
            await api.put(`/thoughts/${id}/resonate`);
            setThoughts(prev => prev.map(t => {
                if (t._id === id) {
                    const hasLiked = t.resonates.includes(user._id);
                    return {
                        ...t,
                        resonates: hasLiked
                            ? t.resonates.filter(uid => uid !== user._id)
                            : [...t.resonates, user._id]
                    };
                }
                return t;
            }));
        } catch (error) {
            toast.error('Failed to resonate');
        }
    };

    const handleDoubleClick = async (thought) => {
        if (thought._id === 'seed-1') return;
        if (thought.isAnonymous) {
            toast('This frequency is anonymous', { icon: '🤫' });
            return;
        }
        if (thought.author?._id === user._id) {
            toast('This is your own frequency', { icon: '✨' });
            return;
        }

        try {
            const response = await api.post('/interactions/swipe', {
                swipeeId: thought.author?._id,
                action: 'initiated_chat'
            });
            toast.success(`Opening conversation with ${thought.author?.username}`);
            navigate(`/chat/${response.data.conversationId}`);
        } catch (error) {
            toast.error('Failed to initiate conversation');
        }
    };

    return (
        <Layout>
            <div className="space-y-10">

                {/* Header Panel */}
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 glass-card p-6 md:p-10 relative overflow-hidden group min-h-0 md:min-h-[280px] flex items-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f468c0]/10 via-transparent to-[#3dadff]/10 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3dadff]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left w-full">
                            <img
                                src="/gen_mascot_coffee.png"
                                alt="Mascot"
                                className="w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-[0_0_20px_rgba(61,173,255,0.4)] animate-float"
                            />
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-4xl font-outfit font-extrabold text-white mb-2 md:mb-4 tracking-tight">
                                    Your <span className="gradient-text">Quiet Corner</span>
                                </h1>
                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
                                    Deep Connections, Quiet Spaces, Anonymous Communities, Thoughtful Pairing.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-6 md:mt-8">
                                    <button
                                        onClick={() => setContent(' ')}
                                        className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Post Thought</span>
                                    </button>
                                    <button className="btn-secondary py-2 px-4 text-sm" onClick={() => navigate('/stack')}>Start Journey</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Common Grounds Widget */}
                    <div className="w-full lg:w-80 glass-card p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 md:mb-6 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#3dadff]" />
                                Common Grounds
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {commonGrounds.length > 0 ? (
                                    commonGrounds.slice(0, 10).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[10px] md:text-xs font-bold text-slate-400 hover:text-[#3dadff] transition-all cursor-pointer"
                                        >
                                            #{tag}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-600 italic">Finding frequencies...</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-700 italic mt-4 md:mt-6 uppercase tracking-wider font-bold">Resonating with {commonGrounds.length * 10 || 'uncounted'} souls</p>
                    </div>
                </div>

                {/* Secondary Grid Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">

                    {/* Community Events */}
                    <div className="xl:col-span-1 glass-card p-6 md:p-8 overflow-hidden relative">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 md:mb-8 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Events
                        </h3>
                        <div className="space-y-4 md:space-y-6">
                            {events.slice(0, 4).length > 0 ? (
                                events.slice(0, 4).map(event => (
                                    <div key={event._id} className="flex gap-4 group cursor-pointer" onClick={() => navigate('/communities')}>
                                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-outfit font-bold text-slate-500 uppercase text-xs md:text-sm">
                                            {event.title.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs md:text-sm font-bold text-slate-200 group-hover:text-[#3dadff] transition-all truncate">
                                                {event.title}
                                            </h4>
                                            <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                                                {new Date(event.scheduledDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Ghost className="w-6 h-6 text-slate-800 mx-auto mb-2" />
                                    <p className="text-[10px] text-slate-600 font-bold uppercase">No events</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scattered Agora Journey Space */}
                    <div 
                        className="xl:col-span-2 glass-card h-[400px] md:h-[500px] relative overflow-hidden bg-black/40"
                        onClick={() => setSelectedThoughtId(null)}
                    >
                        <div className="absolute top-8 left-8 z-30">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" />
                                Agora Journey Space
                            </h3>
                        </div>

                        <div className="absolute inset-0 bg-[#050510]/60 backdrop-blur-[2px] z-10 pointer-events-none"></div>

                        <div className="relative h-full w-full z-20 overflow-y-auto custom-scrollbar p-12">
                            <div className="relative w-full h-[800px]">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <ThoughtSkeleton />
                                    </div>
                                ) : (
                                    thoughts.map((thought) => (
                                        <motion.div
                                            key={thought._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                left: `${thought.pos.x}%`,
                                                top: `${thought.pos.y}%`,
                                                zIndex: selectedThoughtId === thought._id ? 100 : 20
                                            }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="absolute md:group"
                                            style={{ transform: 'translate(-50%, -50%)' }}
                                            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(thought); }}
                                            onClick={(e) => { e.stopPropagation(); setSelectedThoughtId(selectedThoughtId === thought._id ? null : thought._id); }}
                                        >
                                            <motion.div
                                                className={`thought-bubble ${selectedThoughtId === thought._id ? 'selected' : ''}`}
                                                animate={{ 
                                                    width: selectedThoughtId === thought._id ? 'auto' : 24, 
                                                    height: selectedThoughtId === thought._id ? 'auto' : 24,
                                                    scale: selectedThoughtId === thought._id ? 1.1 : 1
                                                }}
                                                whileHover={{ width: 'auto', height: 'auto', scale: 1.1 }}
                                                transition={{ duration: 0.3, ease: "easeIn" }}
                                                style={{
                                                    boxShadow: `0 0 25px ${thought.pos.color}88`,
                                                    border: `1px solid ${thought.pos.color}66`
                                                }}
                                            >
                                                {/* Internal Content */}
                                                <div className={`transition-all duration-300 overflow-hidden ${selectedThoughtId === thought._id ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100 pointer-events-none md:group-hover:pointer-events-auto'}`}>
                                                    <div className="min-w-[180px] max-w-[260px] p-6">
                                                        <p className="text-[14px] font-bold text-slate-100 mb-4 line-clamp-6 md:group-hover:line-clamp-none leading-relaxed">
                                                            {thought.content}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleResonate(thought._id); }}
                                                                className={`flex items-center gap-2 text-[10px] font-black ${thought.resonates?.includes(user._id) ? 'text-[#f468c0]' : 'text-slate-500 hover:text-[#f468c0]'}`}
                                                            >
                                                                <Sparkles className="w-4 h-4" />
                                                                {thought.resonates?.length || 0}
                                                            </button>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                                {thought.isAnonymous ? 'Anonymous' : `@${thought.author?.username || 'Soul'}`}
                                                            </span>
                                                        </div>
                                                        <p className="text-[8px] text-slate-700 uppercase tracking-[0.2em] font-black mt-4 text-center">Double Tap to Connect</p>
                                                    </div>
                                                </div>

                                                {/* Dot Placeholder (Glow state) */}
                                                <div className={`absolute inset-0 flex items-center justify-center transition-all ${selectedThoughtId === thought._id ? 'hidden' : 'md:group-hover:hidden'}`}>
                                                    <div className="relative">
                                                        <div className="w-3 h-3 rounded-full z-10" style={{ backgroundColor: thought.pos.color }}></div>
                                                        <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-100 scale-150" style={{ backgroundColor: thought.pos.color }}></div>
                                                        <div className="absolute inset-0 w-3 h-3 rounded-full blur-md opacity-50" style={{ backgroundColor: thought.pos.color }}></div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Post Overlay Trigger */}
                        <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 z-30">
                            <button
                                onClick={() => setContent(content || ' ')}
                                className="w-14 h-14 bg-gradient-to-r from-[#f468c0] to-[#3dadff] text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,104,192,0.4)] hover:scale-110 active:scale-95 transition-all animate-pulse-slow"
                            >
                                <Plus className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Modal Overlay */}
            <AnimatePresence>
                {content !== '' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050510]/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card max-w-lg w-full p-10 border-white/10"
                        >
                            <h3 className="text-3xl font-outfit font-black text-white mb-2">Whisper <span className="gradient-text">Silently</span></h3>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Your thoughts drift like seeds in the Agora space.</p>

                            <form onSubmit={handlePost}>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-slate-200 outline-none focus:border-[#3dadff]/50 min-h-[180px] resize-none mb-8 text-lg font-medium tracking-tight"
                                    placeholder="What's your quiet frequency?"
                                    value={content === ' ' ? '' : content}
                                    onChange={(e) => setContent(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setContent('')}
                                        className="text-sm font-black text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-[0.2em]"
                                    >
                                        Cancel
                                    </button>
                                    <div className="flex items-center gap-8">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={isAnonymous}
                                                onChange={() => setIsAnonymous(!isAnonymous)}
                                                className="hidden"
                                            />
                                            <div className="text-right">
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isAnonymous ? 'text-[#3dadff]' : 'text-slate-600'}`}>Ghost Mode</p>
                                                <p className="text-[8px] text-slate-700 font-bold">{isAnonymous ? 'Identity Hidden' : 'Public Seed'}</p>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full transition-all relative ${isAnonymous ? 'bg-[#3dadff] shadow-[0_0_15px_rgba(61,173,255,0.4)]' : 'bg-white/10'}`}>
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'translate-x-6' : ''}`}></div>
                                            </div>
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={isPosting || !content.trim()}
                                            className="btn-primary py-4 px-8 text-lg"
                                        >
                                            {isPosting ? 'Planting...' : 'Share Whisper'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default Agora;
