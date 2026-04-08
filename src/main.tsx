import React from 'react';
import ReactDOM from 'react-dom/client';
import { LazyMotion } from 'framer-motion';
import App from './App.tsx';
import './index.css';

const loadFeatures = () => import('./lib/framer-features').then(res => res.default);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LazyMotion features={loadFeatures} strict>
      <App />
    </LazyMotion>
  </React.StrictMode>,
);
