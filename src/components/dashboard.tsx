"use client";
import React from "react";
import { Search, Calendar } from "lucide-react";

import { DashboardCardProps } from "@/types";

const DashboardCard: React.FC<DashboardCardProps> = ({ title, index }) => {
  return (
    <div className="theme-card rounded-lg border border-white/10 p-4 transition-all duration-200 hover:border-violet-300/40 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-100 truncate">
              {title}
            </h3>
            <p className="text-xs text-gray-400">Data</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-white">—</div>
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-500">—</span>
          <span className="text-sm text-gray-400">—</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const dashboardCards = [
    "Sample Card 1",
    "Sample Card 2",
    "Sample Card 3",
    "Sample Card 4",
    "Sample Card 5",
    "Sample Card 6",
  ];

  return (
    <div className="flex-1 min-h-screen overflow-y-auto bg-transparent lg:ml-64">
      <header className="border-b border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="ml-6 sm:ml-12">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Welcome back! Here's what's happening.
            </p>
          </div>

          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              className="theme-input w-48 rounded-lg border border-white/20 py-2 pl-10 pr-4 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 md:w-64"
            />
          </div>
        </div>

        <div className="relative sm:hidden mt-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="theme-input w-full rounded-lg border border-white/20 py-2 pl-10 pr-4 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500"
          />
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="theme-card rounded-lg border border-white/10 p-3 sm:p-4"
              >
                <div className="text-lg sm:text-xl font-bold text-white">—</div>
                <div className="text-xs sm:text-sm text-gray-300">—</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {dashboardCards.map((title, index) => (
            <DashboardCard key={index} title={title} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
