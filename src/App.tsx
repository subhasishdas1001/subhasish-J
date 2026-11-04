/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { PublicPortfolio } from './components/PublicPortfolio';
import { AdminDashboard } from './components/admin/AdminDashboard';

function isCurrentlyAdminRoute(): boolean {
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  return (
    path === '/admin' ||
    path.endsWith('/admin') ||
    hash === '#admin' ||
    hash.startsWith('#/admin') ||
    params.get('admin') === '1'
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    isCurrentlyAdminRoute()
  );

  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(isCurrentlyAdminRoute());
    };
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateToAdmin = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = '#admin';
    }
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToPublic = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <PortfolioProvider>
      {isAdminRoute ? (
        <AdminDashboard onNavigatePublic={navigateToPublic} />
      ) : (
        <PublicPortfolio onNavigateAdmin={navigateToAdmin} />
      )}
    </PortfolioProvider>
  );
}
