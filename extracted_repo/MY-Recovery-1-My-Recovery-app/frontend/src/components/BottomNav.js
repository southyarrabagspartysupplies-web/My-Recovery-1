import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Wrench, TrendingUp, Settings } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Wrench, label: 'Tools', path: '/coping-tools' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/[0.08]">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/home' && location.pathname === '/');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-xs ${isActive ? 'font-medium' : 'font-normal'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
