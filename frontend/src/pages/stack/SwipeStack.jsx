import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { StackSkeleton } from '../../components/Skeletons';
import { toast } from 'react-hot-toast';
import { X, Sparkles, User, Shield, Zap, Coffee, ChevronRight, Apple, Ghost } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// swipe stack handles browse and connection actions for discovery

const SwipeCard = ({ user, onSwipe, isTop }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);
    const resonateScale = useTransform(x, [-150, 0], [1.25, 1]);
    const passScale = useTransform(x, [0, 150], [1, 1.25]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 120) 
            onSwipe('passed'); 
        
        else if (info.offset.x < -120) 
            onSwipe('initiated_chat'); 
        
    };

    return (
        <motion.div
            style={{ x, rotate, opacity, scale, cursor: isTop ? 'grab' : 'default' }}
            drag={isTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className={`absolute inset-0 w-full h-full glass-card overflow-hidden transition-shadow ${isTop ? 'z-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'z-10 scale-[0.92] opacity-40 -translate-y-4'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-600/[0.1] via-transparent to-purple-800/[0.1] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/[0.08] rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="h-full flex flex-col p-10 relative z-10">
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">

                    
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
                        <div className="w-40 h-40 rounded-full bg-[#0a0a1a] border-2 border-primary-500/40 flex items-center justify-center relative overflow-hidden group-hover:border-primary-500 transition-colors">
                            <div className="w-full h-full bg-gradient-to-br from-primary-600/10 to-purple-600/10 flex items-center justify-center overflow-hidden">
                                <User className="w-20 h-20 text-primary-500/20 group-hover:text-primary-500/40 transition-all" />
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#050510] border border-primary-500/50 px-5 py-1.5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            <span className="text-xs font-black text-white flex items-center gap-2 tracking-widest uppercase">
                                <Zap className="w-3.5 h-3.5 text-primary-400 fill-current" />
                                {Math.round((user.matchScore || 0.85) * 100)}% Match
                            </span>
                        </div>
                    </div>

                    <div className="pt-6">
                        <h2 className="text-3xl font-outfit font-extrabold text-white mb-2 tracking-tight group-hover:gradient-text transition-all">
                            {user.username}
                        </h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] text-slate-500 rounded-full uppercase tracking-[0.2em] text-[10px] font-black border border-white/5">
                            <Shield className="w-3 h-3" />
                            {user.socializingCapability || 'Listener'}
                        </div>
                    </div>

                    <p className="text-slate-400 leading-relaxed italic text-sm max-w-xs font-medium">
                        "{user.bio || 'Silence is a friend who never betrays...'}"
                    </p>

                    
                    <div className="flex flex-wrap justify-center gap-3 max-w-sm pt-4">
                        {(user.interests || ['Deep Talk', 'Reading', 'Stargazing']).slice(0, 4).map((interest, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[11px] font-bold text-slate-300 hover:bg-white/[0.06] transition-colors">
                                <Sparkles className="w-3 h-3 text-primary-500" />
                                {interest}
                            </div>
                        ))}
                    </div>
                </div>

                
                <div className="pt-10 border-t border-white/[0.06] flex items-center justify-between">
                    
                    <motion.div 
                        style={{ scale: resonateScale }}
                        className="flex flex-col items-center gap-2 text-primary-500 hover:text-primary-400 transition-all cursor-pointer"
                    >
                        <div className="p-4 rounded-2xl border border-primary-500/20 bg-primary-500/[0.05] hover:bg-primary-500/20 transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-[0.2em]">Resonate</span>
                    </motion.div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em]">Discovering</span>
                    </div>

                    
                    <motion.div 
                        style={{ scale: passScale }}
                        className="flex flex-col items-center gap-2 text-slate-600 hover:text-white transition-all cursor-pointer"
                    >
                        <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/10 transition-all">
                            <X className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-[0.2em]">Pass</span>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const SwipeStack = () => {
    const [stack, setStack] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('intro'); 
    const [errorStatus, setErrorStatus] = useState(null);
    const navigate = useNavigate();

    const fetchStack = async () => {
        try {
            setLoading(true);
            const response = await api.get('/interactions/stack');
            setStack(response.data);
            setErrorStatus(null);
        } catch (error) {
            if (error.response?.status === 400) {
                setErrorStatus(400);
            } else {
                toast.error('Failed to load discovery stack');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStack();
    }, []);

    const handleSwipe = async (action) => {
        const swipedUser = stack[0];
        if (!swipedUser) return;

        setStack(prev => prev.slice(1));

        try {
            const response = await api.post('/interactions/swipe', {
                swipeeId: swipedUser._id,
                action: action
            });

            if (action === 'initiated_chat') {
                toast.success(`Resonated with ${swipedUser.username}!`);
                navigate(`/chat/${response.data.conversationId}`);
            }
        } catch (error) {
            toast.error('Connection lost in the silence. Try again.');
            fetchStack();
        }
    };

    const IntroView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col lg:flex-row items-center gap-10 md:gap-16 w-full max-w-5xl mx-auto"
        >
            
            <div className="flex-1 space-y-8 md:space-y-12">
                <div className="space-y-4 md:space-y-6 text-center md:text-left">
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Curated Journey</h3>
                    <h1 className="text-4xl md:text-6xl font-outfit font-extrabold text-white leading-tight tracking-tight">
                        QUIET<br /><span className="gradient-text">CONVERSATIONS</span>
                    </h1>
                </div>

                <div className="glass-card p-8 md:p-10 relative overflow-hidden group border-primary-500/20 max-w-md mx-auto md:mx-0">
                    <div className="absolute inset-0 bg-primary-600/[0.03] pointer-events-none"></div>
                    <div className="flex flex-col items-center gap-6 md:gap-8 relative z-10 text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                            <Coffee className="w-10 h-10 md:w-12 md:h-12 text-primary-400 animate-float" />
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            <h4 className="text-lg md:text-xl font-bold text-white">Thoughtful pairing, hidden profile.</h4>
                            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">Connect deeply, at your own pace. Discover frequencies that match your own.</p>
                        </div>
                        <button
                            onClick={() => setView('stack')}
                            className="btn-primary w-full py-3 md:py-4 mt-2 flex items-center justify-center gap-3"
                        >
                            <span>START JOURNEY</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            
            <div className="flex-1 hidden md:block relative">
                <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-[120px] -z-10"></div>
                <img
                    src="/gen_mascot_welcome.png"
                    className="w-full h-auto max-w-sm lg:max-w-md mx-auto object-contain animate-float drop-shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                    alt="Journey"
                />
            </div>
        </motion.div>
    );

    const MissingInterestsView = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center max-w-sm mx-auto px-4"
        >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-400 animate-pulse" />
            </div>

            <h3 className="text-xl md:text-2xl font-outfit font-bold text-white mb-3 md:mb-4">A Silent Frequency</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-8 md:mb-10 font-medium italic">
                Your quiet corner needs a few more details before the resonance can find you. Tell us about your world to start discovering others.
            </p>

            <button
                onClick={() => navigate('/profile')}
                className="btn-primary w-full py-3 md:py-4 flex items-center justify-center gap-3 group"
            >
                <span>SEED YOUR FREQUENCY</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );

    return (
        <Layout>
            <div className="min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center py-6 md:py-10">
                <AnimatePresence mode="wait">
                    {errorStatus === 400 ? (
                        <MissingInterestsView key="missing" />
                    ) : view === 'intro' ? (
                        <IntroView key="intro" />
                    ) : (
                        <motion.div
                            key="stack"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-sm px-4"
                        >
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-slate-600 mb-2">Finding Your Frequency</h2>
                                <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
                            </div>

                            <div className="relative w-full aspect-[4/6] md:aspect-[3/6] select-none">
                                <AnimatePresence>
                                    {loading ? (
                                        <StackSkeleton />
                                    ) : stack.length > 0 ? (
                                        stack.map((u, i) => (
                                            i < 2 && (
                                                <SwipeCard
                                                    key={u._id}
                                                    user={u}
                                                    isTop={i === 0}
                                                    onSwipe={handleSwipe}
                                                />
                                            )
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 glass-card border-dashed border-white/10"
                                        >
                                            <Ghost className="w-16 h-16 text-slate-700 mb-6 animate-float" />
                                            <h3 className="text-xl font-bold text-white mb-2">The room is empty</h3>
                                            <p className="text-sm text-slate-500 italic max-w-[200px] mx-auto capitalize">Waiting for new frequencies to drift in. Refresh in a while.</p>
                                            <button
                                                onClick={() => { setView('intro'); fetchStack(); }}
                                                className="mt-10 btn-secondary text-sm"
                                            >
                                                REFRESH ROOM
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default SwipeStack;
