import React from 'react';

export const Dashboard = () => {
  return (
    <>
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
    </>
  );
};
