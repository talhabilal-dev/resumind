import React from 'react';
import Sidebar from '@/components/dashboardSideBar';
import Settings from '@/components/setting';

const SettingsPage: React.FC = () => {
  return (
    <div className="app-theme-bg flex min-h-screen">
      <Sidebar activeItem="Settings" />
      <Settings />
    </div>
  );
};

export default SettingsPage;


