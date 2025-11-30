// src/pages/DashboardPage.jsx
import React from 'react';
import usePageTitle from '../hooks/usePageTitle.js';

const DashboardPage = () => {
  // 👇 Mengatur title menjadi "MRW KOPERASI - Sistem Informasi | Dashboard"
  usePageTitle('Dashboard'); 

  return (
    <div>Ini dashboard</div>
  );
};

export default DashboardPage;