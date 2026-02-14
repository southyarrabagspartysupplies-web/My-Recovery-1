import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import SimpleLineChart from '@/components/SimpleLineChart';
import { progressAPI } from '@/lib/api';
import api from '@/lib/api';
import { toast } from 'sonner';

const Progress = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          progressAPI.getProgress(),
          api.get('/api/progress/chart-data')
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data.data);
      } catch (error) {
        console.error('Progress fetch error:', error);
        setStats({
          days_since_last_used: null,
          current_streak: 0,
          cravings_this_week: 0,
          avg_intensity_this_week: null,
          most_used_tools: [],
          most_common_triggers: []
        });
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Header with Back/Forward Navigation */}
        <TopNav title="Progress" />

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5"
            data-testid="current-streak-card"
          >
            <Award className="w-7 h-7 text-[#C4785C] mb-3" strokeWidth={1.5} />
            <p className="text-3xl font-bold text-white mb-1">
              {stats?.current_streak || 0}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider">Day Streak</p>
          </motion.div>

          {stats && stats.days_since_last_used !== null && stats.days_since_last_used !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5"
              data-testid="days-clean-card"
            >
              <Target className="w-7 h-7 text-[#4A7C59] mb-3" strokeWidth={1.5} />
              <p className="text-3xl font-bold text-white mb-1">
                {stats.days_since_last_used}
              </p>
              <p className="text-xs text-white/40 uppercase tracking-wider">Days Clean</p>
            </motion.div>
          )}
        </div>

        {/* 14-Day Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6"
          data-testid="cravings-chart"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Last 14 Days</h2>
          </div>
          <p className="text-xs text-white/40 mb-4 uppercase tracking-wider">Cravings logged per day</p>
          <SimpleLineChart data={chartData} />
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6"
          data-testid="insights-section"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Insights</h2>
          </div>

          <div className="space-y-6">
            {/* Top 3 Triggers */}
            {stats?.most_common_triggers && stats.most_common_triggers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Top 3 Triggers This Week</p>
                <div className="space-y-2">
                  {stats.most_common_triggers.slice(0, 3).map((item, index) => (
                    <div key={item.trigger} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white/[0.1] text-white/70 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-white/80">{item.trigger}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#C4785C]">{item.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Helpful Tool */}
            {stats?.most_used_tools && stats.most_used_tools.length > 0 && (
              <div>
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Most Helpful Tool</p>
                <div className="p-4 bg-[#4A7C59]/10 border border-[#4A7C59]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-white">
                      {stats.most_used_tools[0].tool}
                    </span>
                    <span className="text-sm font-semibold text-[#7AB889]">
                      {stats.most_used_tools[0].count}x used
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    This tool helped you resist cravings most often
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6"
          data-testid="weekly-summary"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">This Week</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Cravings Logged</p>
              <p className="text-2xl font-bold text-white">
                {stats?.cravings_this_week || 0}
              </p>
            </div>

            {stats && stats.avg_intensity_this_week !== null && stats.avg_intensity_this_week !== undefined && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Avg Intensity</p>
                <p className="text-2xl font-bold text-[#C4785C]">
                  {stats.avg_intensity_this_week.toFixed(1)}/10
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Most Used Tools */}
        {stats?.most_used_tools && stats.most_used_tools.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5"
            data-testid="all-tools-used"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              All Tools Used
            </h2>
            <div className="space-y-2">
              {stats.most_used_tools.slice(1).map((item) => (
                <div key={item.tool} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <span className="text-sm text-white/70">{item.tool}</span>
                  <span className="text-sm font-semibold text-[#7AB889]">{item.count}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Progress;
