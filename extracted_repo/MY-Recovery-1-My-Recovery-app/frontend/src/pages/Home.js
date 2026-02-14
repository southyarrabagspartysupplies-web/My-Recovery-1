import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, BookOpen, TrendingUp, BookMarked, Wrench, Phone, Calendar, Menu, Heart } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        toast.error('Failed to load user data');
        navigate('/auth');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleEmergencyCall = () => {
    if (user?.sponsor_phone) {
      window.location.href = `tel:${user.sponsor_phone}`;
    } else {
      toast.error('No emergency contact set. Add one in Settings.');
      navigate('/settings');
    }
  };

  const menuItems = [
    { icon: BookOpen, label: 'Journal', path: '/journal', testId: 'home-journal-button' },
    { icon: Calendar, label: 'Calendar', path: '/calendar', testId: 'home-calendar-button' },
    { icon: TrendingUp, label: 'Progress', path: '/progress', testId: 'home-progress-button' },
    { icon: Wrench, label: 'Coping Tools', path: '/coping-tools', testId: 'home-coping-tools-button' },
    { icon: BookMarked, label: 'Resources', path: '/resources', testId: 'home-resources-button' },
    { 
      icon: Phone, 
      label: 'Call Emergency Contact', 
      action: handleEmergencyCall, 
      testId: 'home-emergency-call-button',
      highlight: true
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#E57373]" strokeWidth={2} fill="#E57373" />
            <span className="text-sm font-semibold tracking-widest text-white/80 uppercase">
              MyRecovery
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors"
            data-testid="home-menu-button"
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>
        </motion.div>

        {/* Headline - Pulled up closer to logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-base text-white/50 mb-1">
            Welcome back
          </p>
          <h1 className="text-[42px] font-bold tracking-tight text-white leading-none mb-2">
            {user.display_name}
          </h1>
          <p className="text-base text-white/50">
            One day at a time
          </p>
        </motion.div>

        {/* Primary CTA Button - Reddish color */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-testid="home-craving-button"
          onClick={() => navigate('/craving-flow')}
          className="w-full bg-[#3D1F1F] border border-[#8B3A3A] rounded-2xl p-5 mb-4 flex items-center gap-4 hover:bg-[#4A2525] transition-colors active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-[#4A2525] border border-[#8B3A3A] rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#E57373]" />
          </div>
          <div className="text-left flex-1">
            <p className="text-base font-semibold tracking-wide text-white uppercase">
              I'M HAVING A CRAVING
            </p>
            <p className="text-sm text-white/50 mt-0.5">
              Start a guided reset
            </p>
          </div>
        </motion.button>

        {/* Navigation Tiles - 2x3 Grid (includes Calendar and Emergency) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {menuItems.map((item, index) => (
            <motion.button
              key={item.path || item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              data-testid={item.testId}
              onClick={() => item.action ? item.action() : navigate(item.path)}
              className={`rounded-xl p-5 text-left transition-all active:scale-[0.98] ${
                item.highlight 
                  ? 'bg-[#4A7C59]/20 border border-[#4A7C59]/30 hover:border-[#4A7C59]/50' 
                  : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05]'
              }`}
            >
              <item.icon 
                className={`w-6 h-6 mb-3 ${item.highlight ? 'text-[#7AB889]' : 'text-white/60'}`} 
                strokeWidth={1.5} 
              />
              <p className={`text-sm font-medium ${item.highlight ? 'text-[#7AB889]' : 'text-white/80'}`}>
                {item.label}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
