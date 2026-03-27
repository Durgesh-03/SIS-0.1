import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <Database className="w-12 h-12 text-slate-600" />,
  action 
}) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center animate-fade-in border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
      <div className="mb-4 p-4 rounded-full bg-slate-800/50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
