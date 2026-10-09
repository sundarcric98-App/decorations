import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ServiceDetailPage } from './features/public/ServiceDetailPage';
import { PackagesPage } from './features/public/PackagesPage';
import { PortfolioPage } from './features/public/PortfolioPage';
import { PortfolioDetailPage } from './features/public/PortfolioDetailPage';
import { AboutPage } from './features/public/AboutPage';
import { ContactPage } from './features/public/ContactPage';
import { BookEventPage } from './features/public/BookEventPage';
import { PrivacyPolicyPage } from './features/public/PrivacyPolicyPage';
import { TermsPage } from './features/public/TermsPage';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';

// Admin Pages
import { DashboardPage } from './features/admin/dashboard/DashboardPage';
import { EnquiriesListPage } from './features/admin/enquiries/EnquiriesListPage';
import { BookingsListPage } from './features/admin/bookings/BookingsListPage';
import { BookingDetailPage } from './features/admin/bookings/BookingDetailPage';
import { QuotationsListPage } from './features/admin/quotations/QuotationsListPage';
import { QuotationBuilderPage } from './features/admin/quotations/QuotationBuilderPage';
import { PaymentsListPage } from './features/admin/payments/PaymentsListPage';
import { AdminServicesPage } from './features/admin/services/AdminServicesPage';
import { AdminPackagesPage } from './features/admin/packages/AdminPackagesPage';
import { AdminPortfolioPage } from './features/admin/portfolio/AdminPortfolioPage';
import { AdminCalendarPage } from './features/admin/calendar/AdminCalendarPage';
import { CustomersListPage } from './features/admin/customers/CustomersListPage';
import { CustomerDetailPage } from './features/admin/customers/CustomerDetailPage';
import { AdminStaffPage } from './features/admin/staff/AdminStaffPage';
import { AdminVendorsPage } from './features/admin/vendors/AdminVendorsPage';
import { ExpensesListPage } from './features/admin/expenses/ExpensesListPage';
import { ReportsPage } from './features/admin/reports/ReportsPage';
import { NotificationsPage } from './features/admin/notifications/NotificationsPage';
import { AdminSettingsPage } from './features/admin/settings/AdminSettingsPage';

// NotFound Fallback
import { Link } from 'react-router-dom';
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
      <div className="w-16 h-16 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-brand-dark">404 - Page Not Found</h1>
      <p className="text-brand-muted mt-2 max-w-md">
        The page you are looking for might have been moved or does not exist.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button>Return to Home</Button>
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
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:slug" element={<ServiceDetailPage />} />
                    <Route path="/packages" element={<PackagesPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/book-event" element={<BookEventPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/admin/reset-password" element={<ResetPasswordPage />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="enquiries" element={<EnquiriesListPage />} />
                    <Route path="bookings" element={<BookingsListPage />} />
                    <Route path="bookings/:id" element={<BookingDetailPage />} />
                    <Route path="quotations" element={<QuotationsListPage />} />
                    <Route path="quotations/new" element={<QuotationBuilderPage />} />
                    <Route path="quotations/:id" element={<QuotationBuilderPage />} />
                    <Route path="payments" element={<PaymentsListPage />} />
                    <Route path="services" element={<AdminServicesPage />} />
                    <Route path="packages" element={<AdminPackagesPage />} />
                    <Route path="portfolio" element={<AdminPortfolioPage />} />
                    <Route path="calendar" element={<AdminCalendarPage />} />
                    <Route path="customers" element={<CustomersListPage />} />
                    <Route path="customers/:id" element={<CustomerDetailPage />} />
                    <Route path="staff" element={<AdminStaffPage />} />
                    <Route path="vendors" element={<AdminVendorsPage />} />
                    <Route path="expenses" element={<ExpensesListPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
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
