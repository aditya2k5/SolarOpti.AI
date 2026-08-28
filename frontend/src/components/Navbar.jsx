import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, Settings, User } from 'lucide-react';

import logo from '../../assets/SolarOpti-logo.png';
import { ThemeContext } from './ui/themeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Reactive Session Sync Loop
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed parsing user context session payload:", err);
      }
    }
  }, [location.pathname]); // Forces evaluation reassessment across page navigation shifts

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    setIsOpen(false);
    navigate("/", { replace: true });
  };

  const goToSection = (id) => {
    if (location.pathname === '/Index') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/Index#${id}`);
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-black/40 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-[rgba(16,185,129,0.22)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/Index" className="flex items-center gap-2">
              <img src={logo} alt="SolarOpti.AI Logo" className="h-8 w-auto" />
              <span className="text-2xl font-bold gradient-text">SolarOpti.AI</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => goToSection('home')} className={`px-3 py-2 text-sm font-medium transition-colors ${location.pathname === '/Index' && (!location.hash || location.hash === '#home') ? 'text-[#10B981]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`}>
              Home
            </button>
            <button onClick={() => goToSection('about')} className={`px-3 py-2 text-sm font-medium transition-colors ${location.hash === '#about' ? 'text-[#10B981]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`}>
              About
            </button>
            <button onClick={() => goToSection('features')} className={`px-3 py-2 text-sm font-medium transition-colors ${location.hash === '#features' ? 'text-[#10B981]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`}>
              Features
            </button>
            <button onClick={() => goToSection('contact')} className={`px-3 py-2 text-sm font-medium transition-colors ${location.hash === '#contact' ? 'text-[#10B981]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`}>
              Contact
            </button>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-[rgba(16,185,129,0.1)] text-gray-600 dark:text-[#34D399] hover:ring-2 ring-[#10B981] transition-all duration-300"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Identity Controller Dropdown Grid Link Block */}
            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-9 w-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500 text-[#10B981] dark:text-emerald-400 font-bold flex items-center justify-center uppercase text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all duration-200"
                >
                  {user.name ? user.name.charAt(0) : <User size={16} />}
                </button>

                {dropdownOpen && (
                  <>
                    {/* Invisible click handler layer to collapse menu smoothly on outside taps */}
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-emerald-500/20 bg-white dark:bg-[#0e161a] p-2 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-emerald-500/10 mb-1 text-left">
                        <p className="text-xs text-gray-400 font-medium truncate">Client Context Profile</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                      </div>
                      
                      <button
                        onClick={() => { setDropdownOpen(false); navigate("/Settings"); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-500/10 hover:text-[#10B981] dark:hover:text-emerald-300 rounded-lg transition flex items-center gap-2"
                      >
                        <Settings size={14} /> Account Settings
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition font-medium mt-1 flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out Account
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/"
                className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Mobile Avatar Shortcut Profile Link instead of heavy menu layers */}
            {user && (
              <button
                onClick={() => navigate("/Settings")}
                className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold flex items-center justify-center uppercase text-xs focus:outline-none mx-1"
                aria-label="Account Configuration Profile"
              >
                {user.name ? user.name.charAt(0) : "U"}
              </button>
            )}

            <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399] hover:bg-[rgba(16,185,129,0.1)] focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drop draw */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#050B0A] border-t border-gray-200 dark:border-[rgba(16,185,129,0.22)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-left">
            <button className={`w-full text-left block px-3 py-2 text-base font-medium rounded-md ${location.pathname === '/Index' && (!location.hash || location.hash === '#home') ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`} onClick={() => goToSection('home')}>
              Home
            </button>
            <button className={`w-full text-left block px-3 py-2 text-base font-medium rounded-md ${location.hash === '#about' ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`} onClick={() => goToSection('about')}>
              About
            </button>
            <button className={`w-full text-left block px-3 py-2 text-base font-medium rounded-md ${location.hash === '#features' ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`} onClick={() => goToSection('features')}>
              Features
            </button>
            <button className={`w-full text-left block px-3 py-2 text-base font-medium rounded-md ${location.hash === '#contact' ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : 'text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-[#34D399]'}`} onClick={() => goToSection('contact')}>
              Contact
            </button>

            {/* Mobile Auth Bottom Anchors */}
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-[rgba(16,185,129,0.1)] mt-2">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-1 mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Profile Dashboard: <span className="text-[#10B981] font-bold">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { setIsOpen(false); navigate("/Settings"); }}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-gray-600 dark:text-[rgba(248,250,252,0.72)] hover:text-emerald-400 rounded-md"
                  >
                    ⚙️ Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 text-base font-medium text-red-500 hover:bg-red-500/10 rounded-md"
                  >
                    🚪 Logout Account
                  </button>
                </div>
              ) : (
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="block text-center mx-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-xl transition duration-200 shadow-md"
                >
                  Sign In Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;