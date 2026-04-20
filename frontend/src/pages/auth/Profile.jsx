import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Tag, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  Eye, 
  EyeOff,
  UserCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [interestInput, setInterestInput] = useState('');
  
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    age: user?.age || '',
    gender: user?.gender || '',
    socializingCapability: user?.socializingCapability || 'Takes Time',
    isVisible: user?.isVisible !== undefined ? user.isVisible : true,
    interests: user?.interests || []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        age: user.age || '',
        gender: user.gender || '',
        socializingCapability: user.socializingCapability || 'Takes Time',
        isVisible: user.isVisible !== undefined ? user.isVisible : true,
        interests: user.interests || []
      });
    }
  }, [user]);

  const handleAddInterest = (e) => {
    e.preventDefault();
    const val = interestInput.trim();
    if (val && !formData.interests.includes(val)) {
      if (formData.interests.length >= 10) {
        toast.error('Maximum 10 interests allowed');
        return;
      }
      setFormData({ ...formData, interests: [...formData.interests, val] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== interest)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.interests.length < 3) {
      toast.error('Please add at least 3 interests');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/profile', formData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-outfit font-bold text-white">
            Profile <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Manage your frequency and personal space</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Details Section */}
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <UserCircle className="w-5 h-5 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Short Bio</label>
                <textarea
                  className="input-field h-24 resize-none py-3"
                  placeholder="Tell others about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Age</label>
                <input
                  type="number"
                  className="input-field py-3"
                  placeholder="e.g. 24"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                <select
                  className="input-field appearance-none py-3"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Socializing Style</label>
                <select
                  className="input-field appearance-none py-3"
                  value={formData.socializingCapability}
                  onChange={(e) => setFormData({ ...formData, socializingCapability: e.target.value })}
                >
                  <option value="Listener">Listener</option>
                  <option value="Takes Time">Takes Time to Open Up</option>
                  <option value="Open Communicator">Open Communicator</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    formData.isVisible 
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-500'
                  }`}
                >
                  {formData.isVisible ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Visible to others</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm">Hidden Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.section>

          {/* Interests Section */}
          <motion.section 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="glass-card p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-primary-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                <h2 className="text-lg font-bold text-white">Interests</h2>
              </div>
              <span className={`text-xs font-medium ${formData.interests.length < 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                {formData.interests.length} / 10
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.interests.map((interest) => (
                    <motion.div
                      key={interest}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/15 text-primary-300 rounded-full text-sm font-medium border border-primary-500/20"
                    >
                      {interest}
                      <button 
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {formData.interests.length === 0 && (
                   <p className="text-sm text-slate-600 italic">No interests added yet...</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Reading, Star Gazing"
                  className="input-field py-3"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="btn-secondary px-4 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <Sparkles className="w-3 h-3 text-amber-400/60" />
                <span>add at least 3 interests to generate your ai profile</span>
              </div>
            </div>
          </motion.section>

          <footer className="flex items-center gap-4">
            <button
               type="submit"
               disabled={loading}
               className="flex-1 btn-primary flex items-center justify-center gap-2 h-12 text-base font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="btn-secondary h-12 px-8"
            >
              Discard
            </button>
          </footer>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
