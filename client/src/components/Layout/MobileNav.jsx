import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiHeart,
  FiUser,
  FiPlus,
} from 'react-icons/fi';

const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Search', href: '/search', icon: FiSearch },
    { name: 'Create', href: '/create', icon: FiPlus },
    { name: 'Explore', href: '/explore', icon: FiCompass },
    { name: 'Profile', href: `/${user?.username}`, icon: FiUser },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-social-card border-t border-social-border z-50">
      <nav className="flex justify-around py-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-primary-500'
                  : 'text-social-textSecondary hover:text-social-text'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNav; 