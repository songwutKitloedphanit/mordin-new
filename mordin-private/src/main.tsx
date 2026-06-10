import nProgress from 'nprogress';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'nprogress/nprogress.css';
import './index.css';

import ScrollToTop from './components/gui/ScrollToTop';

import App from '@/App';
import { AuthProvider } from '@/contexts/AuthContext';

nProgress.configure({ showSpinner: false });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/private">
      <AuthProvider>
        <ScrollToTop />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
