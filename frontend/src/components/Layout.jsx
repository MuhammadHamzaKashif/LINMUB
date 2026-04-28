import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Layers, 
  Compass, 
  Settings, 
  Search, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
 
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate('/');
  };
 
  const navItems = [
    { icon: MessageSquare, label: 'Messages', path: '/chat' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: Layers, label: 'Instant Match', path: '/stack' },
    { icon: Compass, label: 'Curated Journeys', path: '/home' }, // Using Home as Agora/Curated Journey
    { icon: Settings, label: 'Account Settings', path: '/profile' },
  ];
 
  return (
    <div className="flex h-screen bg-[#050510] text-slate-100 overflow-hidden noise-overlay font-sans">
        
      {/* Sidebar - Reference Panel 2 */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-white/[0.06] bg-[#050510] relative z-20 shrink-0">
        <div className="p-6 mb-8 flex justify-center md:justify-start items-center gap-3">
            <NavLink to="/home" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <img src="/gen_mascot_coffee.png" className="w-full h-full object-cover scale-150" alt="Home" />
                </div>
                <span className="hidden md:block font-outfit font-extrabold text-xl tracking-tight text-white group-hover:gradient-text transition-all">LINMUB</span>
            </NavLink>
        </div>
 
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
              }`
            }
          >
            <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-xl transition-all ${window.location.pathname === '/home' ? 'bg-primary-600/20 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'group-hover:bg-white/5'}`}>
                    <Compass className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Home</span>
            </div>
          </NavLink>
 
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-xl transition-all ${item.path !== '/home' && window.location.pathname.startsWith(item.path) ? 'bg-primary-600/20 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'group-hover:bg-white/5'}`}>
                      <item.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </div>
            </NavLink>
          ))}
        </nav>
 
        <div className="p-6 border-t border-white/[0.06] space-y-6">
            <div className="space-y-1">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">We stand for introverts.</p>
                <div className="flex gap-3 text-[10px] text-slate-700 font-medium pb-2">
                    <button className="hover:text-slate-400 transition-colors">Terms</button>
                    <button className="hover:text-slate-400 transition-colors">Privacy</button>
                    <button className="hover:text-slate-400 transition-colors">FAQ</button>
                </div>
                <p className="text-[10px] text-slate-800">© 2026 LINMUB Enterprise, Inc.</p>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-start gap-4 p-2 text-slate-600 hover:text-red-400 transition-all group"
            >
                <div className="p-2 rounded-xl group-hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Sign Out</span>
            </button>
        </div>
      </aside>
 
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* Top Header - Responsive */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-[#050510] border-b border-white/[0.06] shrink-0 relative z-10">
            <div className="flex-1 max-w-xs md:max-w-xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 md:py-2 pl-10 md:pl-12 pr-4 text-xs md:text-sm focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all"
                />
            </div>
 
            <div className="flex items-center gap-3 md:gap-6 ml-4">
                <button className="p-2 text-slate-500 hover:text-white transition-colors relative">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full border-2 border-[#050510]"></div>
                </button>
 
                <NavLink 
                    to="/profile"
                    className="flex items-center gap-3 pl-3 md:pl-4 border-l border-white/10 group"
                >
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-white group-hover:gradient-text transition-colors">{user?.username}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{user?.socializingCapability || 'Listener'}</p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary-500/30 overflow-hidden group-hover:border-primary-500 transition-all shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                        <div className="w-full h-full bg-primary-600/20 flex items-center justify-center font-bold text-primary-400 text-xs md:text-sm capitalize">
                            {user?.username?.charAt(0)}
                        </div>
                    </div>
                </NavLink>
            </div>
        </header>
 
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
              {children}
          </div>
        </div>
 
        {/* Mobile Nav - Hidden on desktop, simplified for mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050510]/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-50">
            {navItems.slice(0, 4).map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `p-2 transition-all ${isActive ? 'text-primary-400' : 'text-slate-500'}`
                    }
                >
                    <item.icon className="w-6 h-6" />
                </NavLink>
            ))}
            <button onClick={handleLogout} className="p-2 text-slate-500">
                <LogOut className="w-6 h-6" />
            </button>
        </nav>
      </main>
    </div>
  );
};
 
export default Layout;
