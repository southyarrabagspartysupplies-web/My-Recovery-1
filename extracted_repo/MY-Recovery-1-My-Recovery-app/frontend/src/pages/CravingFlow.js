import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Heart, Users, DoorOpen, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TopNav } from '@/components/TopNav';
import { cravingAPI } from '@/lib/api';
import { toast } from 'sonner';

const TRIGGERS = [
  'Boredom',
  'Loneliness',
  'Stress',
  'Anger',
  'Anxiety',
  'Sadness',
  'Celebration',
  'Social Pressure',
  'Seeing Content/People',
];

const NEED_OPTIONS = [
  { 
    id: 'distract', 
    label: 'Distract myself', 
    icon: Zap,
    description: 'Focus on something else',
    color: '#C4785C'
  },
  { 
    id: 'calm', 
    label: 'Calm down', 
    icon: Heart,
    description: 'Reduce anxiety and stress',
    color: '#4A7C59'
  },
  { 
    id: 'support', 
    label: 'Get support', 
    icon: Users,
    description: 'Connect with someone',
    color: '#5B8DB8'
  },
  { 
    id: 'escape', 
    label: 'Get out of here', 
    icon: DoorOpen,
    description: 'Change my environment',
    color: '#9B7BB8'
  },
  { 
    id: 'reflect', 
    label: 'Reflect', 
    icon: Brain,
    description: 'Process my feelings',
    color: '#B8A07B'
  },
];

const CravingFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [otherTrigger, setOtherTrigger] = useState('');
  const [intensity, setIntensity] = useState([5]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const navigate = useNavigate();

  // Record the date and time when the craving flow begins
  useEffect(() => {
    const startTime = new Date().toISOString();
    setSessionStartTime(startTime);
  }, []);

  const toggleTrigger = (trigger) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleRecordAndNavigate = async () => {
    const triggers = [...selectedTriggers];
    if (otherTrigger.trim()) {
      triggers.push(otherTrigger.trim());
    }

    try {
      // Create the craving session with recorded data
      await cravingAPI.createSession({
        triggers,
        intensity: intensity[0],
        need_type: selectedNeed,
        started_at: sessionStartTime,
      });
      
      toast.success('Craving recorded. Let\'s work through this together.');
      
      // Navigate to Coping Tools page with need type for highlighting
      navigate('/coping-tools', { 
        state: { 
          fromCravingFlow: true,
          intensity: intensity[0],
          needType: selectedNeed,
        } 
      });
    } catch (error) {
      toast.error('Failed to record session');
      // Still navigate to coping tools even if save fails
      navigate('/coping-tools', {
        state: {
          fromCravingFlow: true,
          needType: selectedNeed,
        }
      });
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
    <div className="min-h-screen bg-[#0F1115] p-5 pb-24 relative z-10">
      <div className="max-w-md mx-auto pt-2">
        <TopNav title="Craving Support" />
        
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <StepIndicator />

          <AnimatePresence mode="wait">
            {/* Step 1: What's triggered you? */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                data-testid="craving-flow-step-1"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  What's triggered you?
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Select all that apply
                </p>

                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
                  {TRIGGERS.map((trigger) => (
                    <div
                      key={trigger}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedTriggers.includes(trigger)
                          ? 'bg-white/[0.05] border-white/[0.2]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                      }`}
                      onClick={() => toggleTrigger(trigger)}
                    >
                      <Checkbox
                        data-testid={`trigger-${trigger.toLowerCase().replace(/[/ ]/g, '-')}`}
                        id={trigger}
                        checked={selectedTriggers.includes(trigger)}
                        onCheckedChange={() => toggleTrigger(trigger)}
                        className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#0F1115]"
                      />
                      <Label htmlFor={trigger} className="flex-1 cursor-pointer text-sm text-white/80">
                        {trigger}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <Label className="text-sm font-medium text-white/60">Other (describe)</Label>
                  <Input
                    data-testid="trigger-other-input"
                    placeholder="Something else..."
                    value={otherTrigger}
                    onChange={(e) => setOtherTrigger(e.target.value)}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="craving-flow-back-home"
                    onClick={() => navigate('/home')}
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="craving-flow-next-step-1"
                    onClick={() => setStep(2)}
                    disabled={selectedTriggers.length === 0 && !otherTrigger.trim()}
                    className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: How intense is the craving? */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                data-testid="craving-flow-step-2"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  How intense is the craving?
                </h2>
                <p className="text-sm text-white/50 mb-8">
                  Rate from 1 (mild) to 10 (severe)
                </p>

                <div className="mb-8">
                  <div className="text-center mb-8">
                    <span className="text-6xl font-bold text-white">{intensity[0]}</span>
                  </div>
                  <Slider
                    data-testid="intensity-slider"
                    value={intensity}
                    onValueChange={setIntensity}
                    min={1}
                    max={10}
                    step={1}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-xs text-white/40 uppercase tracking-wider">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="craving-flow-back-step-2"
                    onClick={() => setStep(1)}
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    data-testid="craving-flow-next-step-2"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
                  >
                    Next
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: What do you need? */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                data-testid="craving-flow-step-3"
              >
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                  What do you need?
                </h2>
                <p className="text-sm text-white/50 mb-6">
                  Choose what feels right
                </p>

                <div className="space-y-3 mb-6">
                  {NEED_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedNeed === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        data-testid={`need-option-${option.id}`}
                        onClick={() => setSelectedNeed(option.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/[0.08] border-white/[0.3]'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${option.color}20` }}
                        >
                          <Icon 
                            className="w-6 h-6" 
                            style={{ color: option.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white">
                            {option.label}
                          </h3>
                          <p className="text-sm text-white/50">
                            {option.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-white bg-white'
                            : 'border-white/30'
                        }`}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full rounded-full bg-[#0F1115] scale-50"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="craving-flow-back-step-3"
                    onClick={() => setStep(2)}
                    variant="ghost"
                    className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    data-testid="craving-flow-next-step-3"
                    onClick={handleRecordAndNavigate}
                    disabled={!selectedNeed}
                    className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CravingFlow;
