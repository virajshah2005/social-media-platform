import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiHeart,
  FiUser,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiPlus,
  FiMenu,
  FiX,
  FiMessageCircle,
  FiTrendingUp,
  FiBookmark,
} from 'react-icons/fi';
import Avatar from '../UI/Avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Search', href: '/search', icon: FiSearch },
    { name: 'Explore', href: '/explore', icon: FiCompass },
    { name: 'Messages', href: '/messages', icon: FiMessageCircle },
    { name: 'Analytics', href: '/analytics', icon: FiTrendingUp },
    { name: 'Bookmarks', href: '/bookmarks', icon: FiBookmark },
    { name: 'Notifications', href: '/notifications', icon: FiHeart },
    { name: 'Profile', href: `/${user?.username}`, icon: FiUser },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-social-card border-r border-social-border z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-social-border">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 social-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold gradient-text">Social</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-600 text-white'
                        : 'text-social-text hover:bg-social-border/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-social-border">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-social-border/50 transition-colors"
            >
              <Avatar
                src={user?.profile_picture || '/default-avatar.svg'}
                alt={user?.username}
                size="sm"
              />
              <div className="flex-1 text-left">
                <p className="font-medium text-social-text">{user?.username}</p>
                <p className="text-sm text-social-textSecondary">{user?.full_name}</p>
              </div>
              {showUserMenu ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-social-card border border-social-border rounded-lg shadow-lg">
                <div className="p-2">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-social-border/50 transition-colors"
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-social-border/50 transition-colors w-full"
                  >
                    {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors w-full"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 