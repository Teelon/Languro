import React from 'react';
import { Sidebar } from './components/Sidebar';

export const Dashboard = () => {
  return (
    <div className="flex pt-[100px] min-h-screen"> {/* Adjust pt to match header height */}
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mb-8 text-base text-body-color">
            Welcome to your dashboard. This area is protected.
          </p>
          <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">Recent Activity</h3>
            <p className="text-body-color">No recent activity.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
