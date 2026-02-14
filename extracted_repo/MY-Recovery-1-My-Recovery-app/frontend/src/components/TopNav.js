import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

export const TopNav = ({ title, showHome = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          data-testid="nav-back-button"
          className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-colors rounded-lg"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-white/70" />
        </button>
        {showHome && (
          <button
            onClick={() => navigate('/home')}
            data-testid="nav-home-button"
            className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-colors rounded-lg"
            aria-label="Go home"
          >
            <Home className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>
      
      {title && (
        <h1 className="text-lg font-semibold text-white tracking-tight">
          {title}
        </h1>
      )}
      
      <button
        onClick={handleForward}
        data-testid="nav-forward-button"
        className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-colors rounded-lg"
        aria-label="Go forward"
      >
        <ChevronRight className="w-5 h-5 text-white/70" />
      </button>
    </div>
  );
};

export default TopNav;
