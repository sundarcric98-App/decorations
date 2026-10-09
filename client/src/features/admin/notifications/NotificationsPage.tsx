import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Phone, 
  AlertCircle, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { api } from '../../../lib/api';
import { NotificationItem } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../components/common/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../lib/utils';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const res = await api.get<NotificationItem[]>('/notifications');
      return res.data;
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return api.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      showToast('All notifications marked as read', 'success');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ENQUIRY':
        return <Sparkles className="w-5 h-5 text-brand-gold" />;
      case 'BOOKING':
        return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'FOLLOWUP':
        return <Phone className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-brand-dark" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <Bell className="w-7 h-7 text-brand-gold" />
            Activity & Notifications Center
          </h1>
          <p className="text-sm text-brand-muted">
            Live updates on new client enquiries, payment settlements, and operational reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={notifications.every((n) => n.isRead)}
            className="flex items-center gap-1.5 text-xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border/60">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            filter === 'ALL'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            filter === 'UNREAD'
              ? 'border-brand-gold text-brand-gold'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" message="Loading notifications..." />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications to show"
          description={
            filter === 'UNREAD'
              ? 'You are all caught up! No unread activity alerts.'
              : 'Notifications will appear here when new enquiries or payments occur.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.isRead
                  ? 'border-brand-border/60 bg-white'
                  : 'border-brand-gold/60 bg-brand-gold/5 ring-1 ring-brand-gold/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white border border-brand-border/80 shadow-xs mt-0.5">
                  {getIconForType(notif.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-brand-dark text-sm">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                    )}
                  </div>
                  <p className="text-xs text-brand-muted">{notif.message}</p>
                  <span className="text-[10px] text-brand-muted/70 block pt-1">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!notif.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="text-xs text-brand-muted hover:text-brand-gold font-medium px-2 py-1 rounded transition-colors"
                  >
                    Mark as read
                  </button>
                )}
                {notif.link && (
                  <Link to={notif.link}>
                    <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                      View Details
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
