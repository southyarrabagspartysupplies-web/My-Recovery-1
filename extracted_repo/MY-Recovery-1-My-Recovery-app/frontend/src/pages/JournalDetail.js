import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavigationBar } from '@/components/NavigationBar';
import { journalAPI } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

const JournalDetail = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await journalAPI.getEntry(id);
        setEntry(response.data);
      } catch (error) {
        toast.error('Failed to load entry');
        navigate('/journal');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, navigate]);

  if (loading || !entry) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NavigationBar />
          <h1 className="text-2xl font-bold tracking-tight text-white flex-1">
            Entry Details
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-6"
          data-testid="journal-detail"
        >
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Date</p>
            <p className="text-base text-white font-medium">
              {format(new Date(entry.created_at), 'MMMM d, yyyy • h:mm a')}
            </p>
          </div>

          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Type</p>
            <p className="text-base text-white font-medium">
              {entry.had_craving ? 'Craving logged' : 'Daily check-in'}
            </p>
          </div>

          {entry.triggers.length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Triggers</p>
              <div className="flex flex-wrap gap-2">
                {entry.triggers.map((trigger) => (
                  <span
                    key={trigger}
                    className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] text-white/70 rounded-lg text-sm"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.intensity && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Intensity</p>
              <p className="text-2xl text-[#C4785C] font-bold">
                {entry.intensity}/10
              </p>
            </div>
          )}

          {entry.tools_used.length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Tools Used</p>
              <div className="flex flex-wrap gap-2">
                {entry.tools_used.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 bg-[#4A7C59]/20 border border-[#4A7C59]/30 text-[#7AB889] rounded-lg text-sm"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.outcome && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Outcome</p>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                  entry.outcome === 'resisted'
                    ? 'bg-[#4A7C59]/20 text-[#7AB889]'
                    : entry.outcome === 'partial'
                    ? 'bg-[#8B6914]/20 text-[#C4A24D]'
                    : 'bg-white/[0.05] text-white/50'
                }`}
              >
                {entry.outcome.charAt(0).toUpperCase() + entry.outcome.slice(1)}
              </span>
            </div>
          )}

          {entry.notes && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-base leading-relaxed text-white/80 whitespace-pre-wrap p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                {entry.notes}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JournalDetail;
