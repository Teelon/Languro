'use client';

import Link from 'next/link';
import React from 'react';
import { signOut } from 'next-auth/react';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden lg:flex flex-col min-h-screen">
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold mb-6 text-black dark:text-white">Menu</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block py-2 px-4 text-base font-medium text-body-color hover:text-primary rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Overview
          </Link>
          <Link href="/conjugation" className="block py-2 px-4 text-base font-medium text-body-color hover:text-primary rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Conjugation
          </Link>
          <Link href="/settings" className="block py-2 px-4 text-base font-medium text-body-color hover:text-primary rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            Settings
          </Link>
          {/* Add more links as needed */}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left block py-2 px-4 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};
