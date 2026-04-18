import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import api from '../../api/axios';
import Layout from '../../components/Layout';
import { StackSkeleton } from '../../components/Skeletons';
import { toast } from 'react-hot-toast';
import { X, MessageSquare, Sparkles, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SwipeCard = ({ user, onSwipe, isTop }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const iconScale = useTransform(x, [-100, 0, 100], [1.5, 1, 1.5]);

  const swipeLeftColor = useTransform(x, [-100, 0], ['#f43f5e', '#94a3b8']);
  const swipeRightColor = useTransform(x, [0, 100], ['#94a3b8', '#10b981']);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('passed');
    } else if (info.offset.x < -100) {
      onSwipe('initiated_chat');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, cursor: isTop ? 'grab' : 'default' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 w-full h-full glass-card overflow-hidden transition-shadow ${isTop ? 'shadow-xl z-20' : 'z-10 scale-[0.98] blur-[1px]'}`}
    >
      <div className="h-full flex flex-col p-8">
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center relative">
            <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
            <div className="absolute -bottom-2 bg-white dark:bg-slate-800 px-4 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-primary-600">
                 {Math.round(user.matchScore * 100)}% Match
              </span>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-outfit font-bold text-slate-900 dark:text-white mb-1">
              {user.username}
            </h2>
            <div className="flex items-center justify-center gap-2">
               <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg uppercase tracking-wider font-bold">
                 {user.socializingCapability} social
               </span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
            "{user.bio || 'Silence is my favorite language...'}"
          </p>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <motion.div style={{ scale: iconScale, color: swipeRightColor }} className="flex flex-col items-center gap-1">
             <div className="p-4 rounded-full border border-current">
               <X className="w-6 h-6" />
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest">Pass</span>
          </motion.div>

          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-medium">DRAG TO DISCOVER</span>
          </div>

          <motion.div style={{ scale: iconScale, color: swipeLeftColor }} className="flex flex-col items-center gap-1">
             <div className="p-4 rounded-full border border-current">
               <MessageSquare className="w-6 h-6" />
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest">Connect</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SwipeStack = () => {
  const [stack, setStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStack = async () => {
    try {
      const response = await api.get('/interactions/stack');
      setStack(response.data);
    } catch (error) {
      toast.error('Failed to load discovery stack');
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

    // Optimistic UI
    setStack(prev => prev.slice(1));

    try {
      const response = await api.post('/interactions/swipe', {
        swipeeId: swipedUser._id,
        action: action
      });

      if (action === 'initiated_chat') {
        toast.success(`Interaction initiated with ${swipedUser.username}`);
        navigate(`/chat/${response.data.conversationId}`);
      }
    } catch (error) {
      toast.error('Action failed. Try again.');
      // Revert if critical
      fetchStack();
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-outfit font-bold mb-2">Discovery Stack</h1>
          <p className="text-slate-500 text-sm">Find others who resonate with your frequency</p>
        </div>

        <div className="relative w-full max-w-sm aspect-[3/4]">
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
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 glass-card border-dashed"
              >
                <Shield className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No more matches</h3>
                <p className="text-sm text-slate-500 mt-2">The room is quiet for now. Come back later to find new frequencies.</p>
                <button 
                   onClick={fetchStack}
                   className="mt-6 btn-secondary text-sm"
                >
                  Refresh Stack
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SwipeStack;
