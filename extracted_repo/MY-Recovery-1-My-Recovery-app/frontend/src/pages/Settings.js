import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, LogOut, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authAPI, userAPI } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { toast } from 'sonner';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    sponsor_name: '',
    sponsor_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    timer_minutes: 15,
    sobriety_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
        setFormData({
          display_name: response.data.display_name,
          sponsor_name: response.data.sponsor_name || '',
          sponsor_phone: response.data.sponsor_phone || '',
          emergency_contact_name: response.data.emergency_contact_name || response.data.sponsor_name || '',
          emergency_contact_phone: response.data.emergency_contact_phone || response.data.sponsor_phone || '',
          timer_minutes: response.data.timer_minutes,
          sobriety_date: response.data.sobriety_date || '',
        });
      } catch (error) {
        toast.error('Failed to load settings');
      }
    };
    fetchUser();
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userAPI.updateSettings(formData);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await userAPI.exportData();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'anchor_data_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notifications enabled');
      } else {
        toast.error('Notifications were denied');
      }
    }
  };

  const handleLogout = () => {
    removeToken();
    toast.success('Logged out');
    navigate('/auth');
  };

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
        {/* Header with Back/Forward Navigation */}
        <TopNav title="Settings" />

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <h2 className="text-lg font-semibold text-white mb-5">Profile</h2>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Display Name</Label>
              <Input
                data-testid="settings-display-name-input"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Email</Label>
              <Input
                value={user.email}
                disabled
                className="h-12 bg-white/[0.02] border-white/[0.06] text-white/40 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Sponsor Name</Label>
              <Input
                data-testid="settings-sponsor-name-input"
                placeholder="Your sponsor's name"
                value={formData.sponsor_name}
                onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Sponsor Phone</Label>
              <Input
                data-testid="settings-sponsor-phone-input"
                type="tel"
                placeholder="Your sponsor's phone number"
                value={formData.sponsor_phone}
                onChange={(e) => setFormData({ ...formData, sponsor_phone: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
              />
              <p className="text-xs text-white/40">
                Your sponsor can be contacted from the "Reach Out" coping tool.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Emergency Contact Name</Label>
              <Input
                data-testid="settings-emergency-contact-name-input"
                placeholder="Emergency contact name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Emergency Contact Phone</Label>
              <Input
                data-testid="settings-emergency-contact-phone-input"
                type="tel"
                placeholder="Emergency contact phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
              />
              <p className="text-xs text-white/40">
                This number will be used for the "Call Emergency Contact" button on the home screen and "Contact My Support" in coping tools.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Craving Session Length</Label>
              <Select
                value={String(formData.timer_minutes)}
                onValueChange={(val) => setFormData({ ...formData, timer_minutes: parseInt(val) })}
              >
                <SelectTrigger data-testid="settings-timer-select" className="h-12 bg-white/[0.03] border-white/[0.1] text-white rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D22] border-white/[0.1]">
                  <SelectItem value="10" className="text-white hover:bg-white/[0.05]">10 minutes</SelectItem>
                  <SelectItem value="15" className="text-white hover:bg-white/[0.05]">15 minutes</SelectItem>
                  <SelectItem value="20" className="text-white hover:bg-white/[0.05]">20 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Sobriety Date</Label>
              <Input
                data-testid="settings-sobriety-date-input"
                type="date"
                value={formData.sobriety_date}
                onChange={(e) => setFormData({ ...formData, sobriety_date: e.target.value })}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white rounded-lg"
              />
            </div>
          </div>

          <Button
            data-testid="settings-save-button"
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-6 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-lg font-semibold transition-all active:scale-[0.98]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Bell className="w-5 h-5 text-white/60" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <p className="text-sm text-white/40 mb-4">
            Enable browser notifications to receive calendar reminders and other alerts.
          </p>
          
          {notificationPermission === 'granted' ? (
            <div className="flex items-center gap-2 p-3 bg-[#4A7C59]/20 border border-[#4A7C59]/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#7AB889]" />
              <span className="text-sm text-[#7AB889]">Notifications enabled</span>
            </div>
          ) : notificationPermission === 'denied' ? (
            <div className="flex items-center gap-2 p-3 bg-[#3D1F1F]/50 border border-[#8B3A3A]/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-[#E57373]" />
              <span className="text-sm text-[#E57373]">Notifications blocked. Enable in browser settings.</span>
            </div>
          ) : (
            <Button
              onClick={handleRequestNotifications}
              variant="outline"
              className="w-full h-12 rounded-lg border-white/[0.1] hover:bg-white/[0.05] text-white"
            >
              <Bell className="mr-2 w-5 h-5" />
              Enable Notifications
            </Button>
          )}
        </motion.div>

        {/* Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <h2 className="text-lg font-semibold text-white mb-3">Data</h2>
          <p className="text-sm text-white/40 mb-4">
            Export all your journal entries, craving sessions, and progress data as CSV.
          </p>
          <Button
            data-testid="settings-export-button"
            onClick={handleExport}
            variant="outline"
            className="w-full h-12 rounded-lg border-white/[0.1] hover:bg-white/[0.05] text-white"
          >
            <Download className="mr-2 w-5 h-5" />
            Export Data
          </Button>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-white/40 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-white mb-2">Privacy</h2>
              <p className="text-sm leading-relaxed text-white/40">
                All your data is private and stored securely. Only you have access to your journal entries,
                sessions, and personal information. We do not share your data with anyone.
              </p>
              <button
                onClick={() => navigate('/privacy')}
                className="text-sm text-[#C4785C] hover:text-[#D88A6C] mt-3 flex items-center gap-1"
              >
                Privacy & Data Deletion
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <Button
          data-testid="settings-logout-button"
          onClick={handleLogout}
          variant="ghost"
          className="w-full h-12 rounded-lg text-[#C4785C] hover:text-[#D88A6C] hover:bg-[#C4785C]/10"
        >
          <LogOut className="mr-2 w-5 h-5" />
          Log Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
