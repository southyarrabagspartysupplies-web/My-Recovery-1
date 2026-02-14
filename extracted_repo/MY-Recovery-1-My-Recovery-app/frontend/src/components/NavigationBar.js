import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export const NavigationBar = ({ title, showHome = true }) => {
  const navigate = useNavigate();
  const canGoBack = window.history.state?.idx > 0;

  return (
    <div className="flex items-center gap-3">
      <button
        data-testid="nav-back-button"
        onClick={() => navigate(-1)}
        disabled={!canGoBack}
        className="w-10 h-10 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5 text-white/70" />
      </button>
      {showHome && (
        <button
          data-testid="nav-home-button"
          onClick={() => navigate('/home')}
          className="w-10 h-10 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] rounded-lg transition-colors"
        >
          <Home className="w-5 h-5 text-white/70" />
        </button>
      )}
    </div>
  );
};
