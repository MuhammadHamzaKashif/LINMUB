import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Loader2, Apple, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// landing page contains the initial auth prompts and welcome flow




const WelcomeView = ({ onStartJourney, onSignInWithGoogle, onSignInWithEmail }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex flex-col items-center text-center max-w-lg w-full px-4"
    >
        <p className="text-slate-500 uppercase tracking-[0.3em] font-medium text-[9px] md:text-[10px] mb-6 md:mb-8">Recently Arrived!</p>

        <h1 className="text-5xl md:text-7xl font-outfit font-extrabold text-white mb-2 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            LINMUB
        </h1>

        <div className="relative my-8 md:my-12 group">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-[40px] md:blur-[60px] animate-pulse"></div>
            <img
                src="/gen_mascot_welcome.png"
                alt="Mascot"
                className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 animate-float"
            />
        </div>

        <div className="space-y-3 md:space-y-4 mb-10 md:mb-12">
            <p className="text-lg md:text-xl font-bold text-slate-200 px-4">
                LINMUB: <span className="text-slate-400">Your private, quiet corner of connection.</span>
            </p>
            <p className="text-slate-500 text-xs md:text-sm italic">
                Finding your people should feel like coming home.
            </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[280px] md:max-w-xs transition-all">
            <button
                onClick={onStartJourney}
                className="btn-primary py-3.5 md:py-4 rounded-2xl flex items-center justify-center gap-3 group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Apple className="w-5 h-5 fill-current" />
                <span className="relative z-10 text-sm md:text-base">BEGIN JOURNEY</span>
            </button>

            <button
                onClick={onSignInWithEmail}
                className="w-full h-12 md:h-14 rounded-2xl bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center gap-3 hover:bg-primary-600/30 transition-all font-bold text-sm md:text-base"
            >
                <Mail className="w-5 h-5" />
                <span>SIGN IN</span>
            </button>
        </div>

        <p className="text-[10px] md:text-[11px] text-slate-600 italic mt-10 md:mt-12 tracking-wide font-medium">
            Connections that feel right.<br />
            Private, thoughtful, and cozy.
        </p>
    </motion.div>
);

const AuthView = ({ isLogin, isLoading, formData, setFormData, onSubmit, onToggleMode, onBack }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-md"
    >
        <div className="flex items-center gap-4 mb-10">
            <button
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"
            >
                <LogIn className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-3xl font-outfit font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Join the Room'}
            </h2>
        </div>

        <div className="glass-card p-8 border-white/[0.08]">
            <form onSubmit={onSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Username</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="Your frequency name"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                    <input
                        type="password"
                        required
                        className="input-field"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                {!isLogin && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="space-y-5"
                    >
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Socializing Style</label>
                            <select
                                className="input-field appearance-none"
                                value={formData.socializingCapability}
                                onChange={(e) => setFormData({ ...formData, socializingCapability: e.target.value })}
                            >
                                <option value="Listener">Listener</option>
                                <option value="Takes Time">Takes Time to Open Up</option>
                                <option value="Open Communicator">Open Communicator</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary h-14 text-lg mt-8"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isLogin ? 'Enter Agora' : 'Secure Your Spot'}
                </button>
            </form>

            <button
                onClick={onToggleMode}
                className="w-full mt-6 text-sm text-slate-500 hover:text-primary-400 transition-colors font-medium"
            >
                {isLogin ? "Don't have a corner yet? Join us" : "Already a member? Sign in"}
            </button>
        </div>
    </motion.div>
);

const Landing = () => {
    const [view, setView] = useState('welcome'); 
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
                toast.success(`Welcome back!`);
            } else {
                await register(formData);
                toast.success('Welcome to LINMUB!');
            }
            navigate('/home');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 relative overflow-hidden noise-overlay">
            {}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-primary-600/[0.08] rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-purple-600/[0.06] rounded-full blur-[120px]"></div>
                {}
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse-slow"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {view === 'welcome' ? (
                    <WelcomeView
                        key="welcome"
                        onStartJourney={() => { setIsLogin(false); setView('auth'); }}
                        onSignInWithGoogle={() => { setIsLogin(true); setView('auth'); }}
                        onSignInWithEmail={() => { setIsLogin(true); setView('auth'); }}
                    />
                ) : (
                    <AuthView
                        key="auth"
                        isLogin={isLogin}
                        isLoading={isLoading}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmit}
                        onToggleMode={() => setIsLogin(!isLogin)}
                        onBack={() => setView('welcome')}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Landing;
