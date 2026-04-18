import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = useAuth();

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

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    fetchEvents(community._id);
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
      // Refresh to show joined status if applicable
      fetchCommunities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    } finally {
      setJoining(false);
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
          {selectedCommunity && (
            <button 
              onClick={() => setSelectedCommunity(null)}
              className="text-sm text-primary-600 font-bold flex items-center gap-1 hover:underline"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to all communities
            </button>
          )}
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
                      <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-widest">
                        {community.membersCount || 0} Members
                      </span>
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
              className="space-y-8"
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
                        <span>Anonymous room active</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                         <ShieldAlert className="w-4 h-4" />
                         <span>Rules of Silence</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <button 
                      onClick={() => setShowJoinModal(true)}
                      className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
                    >
                      <Ghost className="w-5 h-5" />
                      Join with Alias
                    </button>
                  </div>
                </div>
              </div>

              {/* Events Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-primary-500" />
                     Upcoming Events
                   </h3>
                   <button className="btn-secondary text-xs flex items-center gap-1">
                     <Plus className="w-3 h-3" />
                     Suggest Event
                   </button>
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
                               {event.location}
                             </div>
                             <div className="flex items-center gap-1.5">
                               <Clock className="w-3.5 h-3.5 text-primary-400" />
                               {new Date(event.date).toLocaleDateString()} at {event.time}
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
        </AnimatePresence>

        {/* Join Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card w-full max-w-md p-8 shadow-2xl overflow-hidden relative"
              >
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-outfit font-bold mb-2">Join Anonymously</h3>
                <p className="text-slate-500 text-sm mb-6">Choose a temporary alias for this community. Your real username will be hidden.</p>
                
                <form onSubmit={handleJoin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Temporary Alias</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="e.g. SilentForest77"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={joining}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
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
