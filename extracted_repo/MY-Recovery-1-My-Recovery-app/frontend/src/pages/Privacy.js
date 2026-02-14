import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Trash2, AlertTriangle, Lock, Database, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationBar } from '@/components/NavigationBar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { toast } from 'sonner';

const Privacy = () => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete('/api/user/delete-account');
      removeToken();
      toast.success('All data deleted. Account removed.');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NavigationBar />
          <h1 className="text-2xl font-bold tracking-tight text-white flex-1">
            Privacy
          </h1>
        </div>

        {/* Privacy Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-white/60" />
            <h2 className="text-lg font-semibold text-white">
              Your Privacy Matters
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-white/50">
            Anchor is designed with your privacy as a top priority. All your data is stored securely 
            and is completely private to your account. We do not share, sell, or access your personal 
            information.
          </p>
        </motion.div>

        {/* What We Store */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-white/60" />
            <h2 className="text-lg font-semibold text-white">
              What We Store
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <FileText className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Journal Entries</p>
                <p className="text-xs text-white/40">
                  Your daily reflections, craving logs, triggers, intensity ratings, tools used, and outcomes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Craving Sessions</p>
                <p className="text-xs text-white/40">
                  Timer sessions, triggers identified, intensity levels, and session outcomes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <Lock className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white mb-1">Settings & Preferences</p>
                <p className="text-xs text-white/40">
                  Display name, timezone, sponsor contact info, timer preferences, and sobriety date.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#4A7C59]/10 border border-[#4A7C59]/20 rounded-xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#7AB889] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#7AB889] mb-2">
                Private & Secure
              </p>
              <p className="text-sm leading-relaxed text-white/70">
                <strong className="text-white">Only you</strong> have access to your data. Your information is encrypted and 
                stored securely. We do not analyze, share, or sell your personal recovery data.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Export Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <h2 className="text-lg font-semibold text-white mb-3">
            Export Your Data
          </h2>
          <p className="text-sm text-white/40 mb-4">
            Download a complete copy of your data including all journal entries, craving sessions, 
            and progress history as a CSV file.
          </p>
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            className="w-full h-12 rounded-xl border-white/[0.1] text-white hover:bg-white/[0.05]"
          >
            Go to Settings to Export
          </Button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-[#C4785C]" />
            <h2 className="text-lg font-semibold text-white">
              Delete My Data
            </h2>
          </div>

          <p className="text-sm text-white/40 mb-6">
            Permanently delete your account and all associated data. This action cannot be undone. 
            All journal entries, craving sessions, settings, and custom resources will be permanently removed.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                data-testid="delete-account-button"
                className="w-full h-12 rounded-xl bg-[#2A1E1B] border border-[#6B4A3B] hover:bg-[#352520] text-[#C4785C]"
              >
                <Trash2 className="mr-2 w-5 h-5" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1A1D22] border-white/[0.1]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-[#C4785C]" />
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-white/50 pt-2">
                  This action cannot be undone. This will permanently delete your account and remove 
                  all your data from our servers including:
                  <ul className="list-disc list-inside mt-3 space-y-1 text-xs">
                    <li>All journal entries</li>
                    <li>All craving sessions and history</li>
                    <li>Progress tracking data</li>
                    <li>Custom resources and settings</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-4">
                <p className="text-sm font-medium mb-2 text-white">
                  Type <strong className="text-[#C4785C]">DELETE</strong> to confirm:
                </p>
                <Input
                  data-testid="delete-confirmation-input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="h-12 text-center font-semibold bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => setConfirmText('')}
                  className="bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1]"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-testid="confirm-delete-button"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'DELETE' || isDeleting}
                  className="bg-[#2A1E1B] border border-[#6B4A3B] hover:bg-[#352520] text-[#C4785C] disabled:opacity-30"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Everything'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
