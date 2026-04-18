import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, UserPlus, LogIn, Loader2 } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        bio: '',
        socializingCapability: 'Listener'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await login(formData.username, formData.password);
                toast.success(`Welcome back, ${formData.username}!`);
            } else {
                await register(formData);
                toast.success('Registration successful! Welcome to LINMUB.');
            }
            navigate('/home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-3xl font-outfit font-bold text-slate-900 dark:text-white">LINMUB</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-light italic">
                        "A peaceful corner for introverts"
                    </p>
                </div>

                <div className="glass-card p-8 border dark:border-slate-800">
                    <div className="flex mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Username</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Unique identifier"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Short Bio</label>
                                        <textarea
                                            className="input-field resize-none h-20"
                                            placeholder="Tell us about your personal space..."
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Socializing Capability</label>
                                        <select
                                            className="input-field appearance-none"
                                            value={formData.socializingCapability}
                                            onChange={(e) => setFormData({ ...formData, socializingCapability: e.target.value })}
                                        >
                                            <option value="Listner">Listener</option>
                                            <option value="Takes Time">Takes Time to Open Up</option>
                                            <option value="Open Communicator">Open Communicator</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center gap-2 mt-6 h-11"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isLogin ? (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Enter the Room</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Join the Community</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Landing;
