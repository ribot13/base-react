// src/hooks/usePageTitle.js
import { useEffect } from 'react';
import config from '../config.json';

const usePageTitle = (pageName) => {
  useEffect(() => {
    // Gabungkan nama halaman dengan nama aplikasi
    document.title = `${config.appName} | ${pageName}`;
  }, [pageName]);
};

export default usePageTitle;