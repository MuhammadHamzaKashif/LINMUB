import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  MessageSquare, 
  Users, 
  LogOut, 
  User,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: Home, label: 'Agora', path: '/home' },
    { icon: Layers, label: 'Stack', path: '/stack' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Users, label: 'Communities', path: '/communities' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg font-outfit">L</span>
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">LINMUB</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <NavLink 
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 hover:ring-2 hover:ring-primary-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold group-hover:scale-110 transition-transform">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.socializingCapability || 'Takes Time'}</p>
            </div>
          </NavLink>
          <div className="flex items-center justify-between px-2">
             <ThemeToggle />
             <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs uppercase">L</span>
            </div>
            <span className="font-outfit font-bold text-lg">LINMUB</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-4xl mx-auto">
             {/* Interest Prompt Banner */}
             <AnimatePresence>
               {user && (!user.interests || user.interests.length === 0) && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mb-6"
                 >
                   <NavLink 
                     to="/profile"
                     className="block p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl group hover:shadow-md transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                         <Sparkles className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Generate your AI Profile!</h4>
                         <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                           Add at least 3 interests to help other introverts find your frequency.
                         </p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </NavLink>
                 </motion.div>
               )}
             </AnimatePresence>

             {children}
           </div>
        </div>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden flex items-center justify-around p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                }`
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-slate-400">
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Exit</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
