import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    sponsor_name: '',
    sponsor_phone: '',
    timer_minutes: 15,
    sobriety_date: ''
  });
  const navigate = useNavigate();

  const handleComplete = async () => {
    try {
      await authAPI.completeOnboarding(formData);
      toast.success('Welcome to MyRecovery!');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to complete onboarding');
    }
  };

  const StepIndicator = () => (
    <div className="flex gap-2 justify-center mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all ${
            i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-5 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <StepIndicator />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                data-testid="onboarding-step-1"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  Important Notice
                </h2>
                <div className="bg-[#2A1E1B] border border-[#6B4A3B] rounded-xl p-5 mb-6 mt-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-[#C4785C] flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed text-white/80">
                      This app is support, <strong className="text-white">not medical care</strong>. If you're in danger or at
                      risk of relapse, contact your sponsor, a trusted person, or emergency services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-8">
                  <Checkbox
                    data-testid="onboarding-disclaimer-checkbox"
                    id="agree"
                    checked={agreed}
                    onCheckedChange={setAgreed}
                    className="mt-1 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#0F1115]"
                  />
                  <Label htmlFor="agree" className="text-sm leading-relaxed text-white/50 cursor-pointer">
                    I understand and agree to use this app as a supplemental support tool
                  </Label>
                </div>

                <Button
                  data-testid="onboarding-next-button-step-1"
                  onClick={() => setStep(2)}
                  disabled={!agreed}
                  className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
                data-testid="onboarding-step-2"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
                  Emergency Contact
                </h2>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">
                    Contact Name (Optional)
                  </Label>
                  <Input
                    data-testid="onboarding-sponsor-name-input"
                    placeholder="John Doe"
                    value={formData.sponsor_name}
                    onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">
                    Contact Phone (Optional)
                  </Label>
                  <Input
                    data-testid="onboarding-sponsor-phone-input"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.sponsor_phone}
                    onChange={(e) => setFormData({ ...formData, sponsor_phone: e.target.value })}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-xl"
                  />
                  <p className="text-xs text-white/40">
                    This will be used for quick access on the home screen.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    data-testid="onboarding-back-button-step-2"
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    data-testid="onboarding-next-button-step-2"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
                  >
                    Continue
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
                data-testid="onboarding-step-3"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
                  Personalize Your Experience
                </h2>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">
                    Craving Session Length
                  </Label>
                  <Select
                    value={String(formData.timer_minutes)}
                    onValueChange={(val) => setFormData({ ...formData, timer_minutes: parseInt(val) })}
                  >
                    <SelectTrigger data-testid="onboarding-timer-select" className="h-12 bg-white/[0.03] border-white/[0.1] text-white rounded-xl">
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
                  <Label className="text-sm font-medium text-white/60">
                    Sobriety Date (Optional)
                  </Label>
                  <Input
                    data-testid="onboarding-sobriety-date-input"
                    type="date"
                    value={formData.sobriety_date}
                    onChange={(e) => setFormData({ ...formData, sobriety_date: e.target.value })}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white rounded-xl"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    data-testid="onboarding-back-button-step-3"
                    onClick={() => setStep(2)}
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    data-testid="onboarding-complete-button"
                    onClick={handleComplete}
                    className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
