import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { journalAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entriesRes, insightsRes] = await Promise.all([
          journalAPI.getEntries(),
          journalAPI.getInsights(),
        ]);
        setEntries(entriesRes.data);
        setInsights(insightsRes.data);
      } catch (error) {
        toast.error('Failed to load journal');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <div className="flex items-center justify-between mb-6">
          <TopNav showHome={true} />
          <Button
            data-testid="journal-add-button"
            onClick={() => navigate('/journal/add')}
            size="icon"
            className="w-10 h-10 bg-white text-[#0F1115] hover:bg-white/90 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
          Journal
        </h1>

        {/* Insights */}
        {insights && insights.total_entries > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6"
            data-testid="journal-insights"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-white/60" />
              <h2 className="text-lg font-semibold text-white">Insights</h2>
            </div>
            
            {insights.top_triggers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Top Triggers</p>
                <div className="flex flex-wrap gap-2">
                  {insights.top_triggers.slice(0, 3).map((item) => (
                    <span
                      key={item.trigger}
                      className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] text-white/70 rounded-lg text-sm"
                    >
                      {item.trigger} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights.most_helpful_tools.length > 0 && (
              <div>
                <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Most Helpful Tools</p>
                <div className="flex flex-wrap gap-2">
                  {insights.most_helpful_tools.slice(0, 3).map((item) => (
                    <span
                      key={item.tool}
                      className="px-3 py-1.5 bg-[#4A7C59]/20 border border-[#4A7C59]/30 text-[#7AB889] rounded-lg text-sm"
                    >
                      {item.tool} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Entries list */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-base text-white/40 mb-6">No entries yet</p>
              <Button
                data-testid="journal-add-first-button"
                onClick={() => navigate('/journal/add')}
                className="bg-white text-[#0F1115] hover:bg-white/90 rounded-xl px-6"
              >
                <Plus className="mr-2 w-5 h-5" />
                Add Your First Entry
              </Button>
            </motion.div>
          ) : (
            entries.map((entry, index) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/journal/${entry.id}`)}
                data-testid={`journal-entry-${index}`}
                className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-5 text-left transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-white/40">
                    {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                  {entry.outcome && (
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        entry.outcome === 'resisted'
                          ? 'bg-[#4A7C59]/20 text-[#7AB889]'
                          : entry.outcome === 'partial'
                          ? 'bg-[#8B6914]/20 text-[#C4A24D]'
                          : 'bg-white/[0.05] text-white/50'
                      }`}
                    >
                      {entry.outcome}
                    </span>
                  )}
                </div>
                <p className="text-base text-white font-medium mb-1">
                  {entry.had_craving ? 'Had a craving' : 'Daily check-in'}
                </p>
                {entry.notes && (
                  <p className="text-sm text-white/50 line-clamp-2">{entry.notes}</p>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Journal;
