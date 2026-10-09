import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppFloating } from './WhatsAppFloating';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-dark selection:bg-brand-gold selection:text-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloating />
    </div>
  );
};
