import React from 'react';
import { BatchStatus, CertificateStatus, DeliveryStatus, Role } from '../../types';

interface BadgeProps {
  status: BatchStatus | CertificateStatus | DeliveryStatus | Role | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const getStyle = () => {
    switch (status) {
      // Batches
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISTRICT_REVIEW':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'QUALITY_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'STATE_REVIEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'APPROVED':
      case 'VALID':
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
      case 'REVOKED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RETURNED':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PROCESSING':
        return 'bg-sky-50 text-sky-700 border-sky-200';

      // Roles
      case 'TRAINING_CENTRE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DISTRICT_OFFICER':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'QUALITY_TEAM':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'STATE_OFFICE':
        return 'bg-purple-50 text-purple-800 border-purple-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full uppercase tracking-wider ${sizeClasses} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
