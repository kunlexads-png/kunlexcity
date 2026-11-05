import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoleSwitcher: React.FC = () => {
  const { user, isGuest, isAdmin, isClient, viewAsGuest, isLoading } = useAuth();

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-amber-500/20 px-3 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isAdmin ? 'bg-amber-400' : isClient ? 'bg-emerald-400' : 'bg-slate-400'
            } animate-pulse`}
          />
          <span className="font-semibold text-slate-300">
            Current Mode:{' '}
            <strong className={isAdmin ? 'text-amber-400' : isClient ? 'text-emerald-400' : 'text-white'}>
              {isAdmin ? 'Administrator' : isClient ? `Client/Buyer (${user?.name})` : 'Guest Visitor'}
            </strong>
          </span>
          {isGuest && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 hidden sm:inline">
              Sign In or Register required to buy properties
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* View as Guest Button */}
          <button
            onClick={viewAsGuest}
            disabled={isLoading || isGuest}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              isGuest
                ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-600'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer'
            }`}
            title="Browse site as guest"
          >
            <Eye className="w-3 h-3 text-slate-400" />
            <span>View as Guest</span>
          </button>

          {isGuest && (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors ml-1"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
