import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Providers
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { PublicLayout } from './components/common/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { HomePage } from './features/public/HomePage';
import { ServicesPage } from './features/public/ServicesPage';
import { PortfolioPage } from './features/public/PortfolioPage';
import { PortfolioDetailPage } from './features/public/PortfolioDetailPage';
import { AboutPage } from './features/public/AboutPage';
import { ContactPage } from './features/public/ContactPage';
import { PrivacyPolicyPage } from './features/public/PrivacyPolicyPage';
import { TermsPage } from './features/public/TermsPage';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';

// Admin Pages
import { DashboardPage } from './features/admin/dashboard/DashboardPage';
import { AdminCategoriesPage } from './features/admin/categories/AdminCategoriesPage';
import { AdminPortfolioPage } from './features/admin/portfolio/AdminPortfolioPage';
import { AdminSettingsPage } from './features/admin/settings/AdminSettingsPage';

// Common Components
import { Button } from './components/common/Button';
import { Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-[#B8955A]/10 text-[#B8955A] flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-[#28231F]">404 - Page Not Found</h1>
      <p className="text-[#77716B] mt-2 max-w-md">
        The page you are looking for might have been moved or does not exist.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="gold">Return to Home</Button>
        </Link>
        <Link to="/services">
          <Button variant="outline">Explore Services</Button>
        </Link>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <SettingsProvider>
                <ScrollToTop />
                <Routes>
                  {/* Public Portfolio & Service Website Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:slug" element={<Navigate to="/portfolio" replace />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* Legacy Route Redirects */}
                    <Route path="/book-event" element={<Navigate to="/contact" replace />} />
                    <Route path="/packages" element={<Navigate to="/services" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin Authentication Route */}
                  <Route path="/admin/login" element={<LoginPage />} />

                  {/* Protected Admin Management Portal */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="portfolio" element={<AdminPortfolioPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Route>
                </Routes>
              </SettingsProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
