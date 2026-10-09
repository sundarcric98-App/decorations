import React from 'react';
import { Badge } from '../common/Badge';

interface StatusBadgeProps {
  status: string;
  type?: 'enquiry' | 'booking' | 'quotation' | 'payment';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'booking' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      // Enquiry Statuses
      case 'NEW':
        return { variant: 'info' as const, label: 'New Enquiry' };
      case 'CONTACTED':
        return { variant: 'warning' as const, label: 'Contacted' };
      case 'CONSULTATION_SCHEDULED':
        return { variant: 'gold' as const, label: 'Consultation' };
      case 'QUOTATION_SENT':
        return { variant: 'info' as const, label: 'Quote Sent' };
      case 'NEGOTIATION':
        return { variant: 'warning' as const, label: 'Negotiation' };
      case 'CONVERTED':
        return { variant: 'success' as const, label: 'Converted' };
      case 'LOST':
        return { variant: 'danger' as const, label: 'Lost' };
      case 'ARCHIVED':
        return { variant: 'neutral' as const, label: 'Archived' };

      // Booking Statuses
      case 'DRAFT':
        return { variant: 'neutral' as const, label: 'Draft' };
      case 'TENTATIVE':
        return { variant: 'warning' as const, label: 'Tentative' };
      case 'CONFIRMED':
        return { variant: 'success' as const, label: 'Confirmed' };
      case 'IN_PROGRESS':
        return { variant: 'gold' as const, label: 'In Progress' };
      case 'COMPLETED':
        return { variant: 'success' as const, label: 'Completed' };
      case 'CANCELLED':
        return { variant: 'danger' as const, label: 'Cancelled' };

      // Quotation Statuses
      case 'SENT':
        return { variant: 'info' as const, label: 'Sent' };
      case 'ACCEPTED':
        return { variant: 'success' as const, label: 'Accepted' };
      case 'REJECTED':
        return { variant: 'danger' as const, label: 'Rejected' };
      case 'EXPIRED':
        return { variant: 'neutral' as const, label: 'Expired' };

      // Payment Statuses
      case 'PAID':
        return { variant: 'success' as const, label: 'Paid' };
      case 'PENDING':
        return { variant: 'warning' as const, label: 'Pending' };
      case 'REFUNDED':
        return { variant: 'danger' as const, label: 'Refunded' };

      default:
        return { variant: 'neutral' as const, label: status };
    }
  };

  const { variant, label } = getBadgeConfig();

  return <Badge variant={variant}>{label}</Badge>;
};
