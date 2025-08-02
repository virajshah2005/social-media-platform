import React from 'react';
import { FiSettings, FiUser, FiLock, FiBell, FiShield, FiHelpCircle } from 'react-icons/fi';

const Settings = () => {
  const settingsSections = [
    {
      title: 'Account',
      icon: FiUser,
      items: [
        { name: 'Edit Profile', description: 'Change your profile information' },
        { name: 'Change Password', description: 'Update your password' },
        { name: 'Privacy', description: 'Manage your privacy settings' },
      ]
    },
    {
      title: 'Notifications',
      icon: FiBell,
      items: [
        { name: 'Push Notifications', description: 'Manage push notification settings' },
        { name: 'Email Notifications', description: 'Control email notifications' },
        { name: 'SMS Notifications', description: 'Set up SMS notifications' },
      ]
    },
    {
      title: 'Security',
      icon: FiShield,
      items: [
        { name: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
        { name: 'Login Activity', description: 'View your recent login activity' },
        { name: 'Blocked Users', description: 'Manage blocked users' },
      ]
    },
    {
      title: 'Support',
      icon: FiHelpCircle,
      items: [
        { name: 'Help Center', description: 'Get help and find answers' },
        { name: 'Report a Problem', description: 'Report bugs or issues' },
        { name: 'Terms of Service', description: 'Read our terms of service' },
        { name: 'Privacy Policy', description: 'Read our privacy policy' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
          <FiSettings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-social-text">Settings</h1>
          <p className="text-social-textSecondary">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="bg-social-card rounded-xl border border-social-border">
            <div className="p-6 border-b border-social-border">
              <div className="flex items-center space-x-3">
                <section.icon className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-social-text">{section.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-lg hover:bg-social-border/50 transition-colors cursor-pointer">
                    <div>
                      <h3 className="font-medium text-social-text">{item.name}</h3>
                      <p className="text-sm text-social-textSecondary">{item.description}</p>
                    </div>
                    <div className="text-social-textSecondary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 rounded-xl border border-red-500/20">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <h3 className="font-medium text-red-400">Delete Account</h3>
                <p className="text-sm text-red-400/70">Permanently delete your account and all data</p>
              </div>
              <button className="btn bg-red-500 text-white hover:bg-red-600">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 