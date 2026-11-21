import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const DemoSwitcher: React.FC = () => {
  const { user } = useAuth();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        return 'Centre Desk';
      case 'DISTRICT_OFFICER':
        return 'District Officer';
      case 'QUALITY_TEAM':
        return 'Quality Auditor';
      case 'STATE_OFFICE':
        return 'State Director';
      default:
        return 'Official';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-800 shadow-xs select-none">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Persona:</span>
      <span className="font-bold text-slate-900">{user?.name}</span>
      <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-mono uppercase font-semibold">
        {getRoleLabel()}
      </span>
    </div>
  );
};
