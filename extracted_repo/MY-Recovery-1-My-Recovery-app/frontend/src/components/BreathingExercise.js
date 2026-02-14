import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const BreathingExercise = ({ tool, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [targetScale, setTargetScale] = useState(1);
  const [animationDuration, setAnimationDuration] = useState(4);
  
  // Use refs to store timers to prevent cleanup issues
  const phaseTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Breathing patterns - memoized to prevent re-creation
  const patterns = useRef({
    '4-7-8': {
      phases: [
        { name: 'in', duration: 4, scale: 1.3, stepIndex: 1 },
        { name: 'hold', duration: 7, scale: 1.3, stepIndex: 2 },
        { name: 'out', duration: 8, scale: 0.75, stepIndex: 3 }
      ],
      totalDuration: 120,
    },
    'Box': {
      phases: [
        { name: 'in', duration: 4, scale: 1.3, stepIndex: 0 },
        { name: 'hold', duration: 4, scale: 1.3, stepIndex: 1 },
        { name: 'out', duration: 4, scale: 0.75, stepIndex: 2 },
        { name: 'hold', duration: 4, scale: 0.75, stepIndex: 3 }
      ],
      totalDuration: 180,
    }
  }).current;

  const patternKey = (tool.title.includes('4-7-8') || tool.title.includes('Deep Breathing')) ? '4-7-8' : 'Box';
  const pattern = patterns[patternKey];
  const currentPhase = pattern.phases[phaseIndex % pattern.phases.length];

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Schedule next phase
  const scheduleNextPhase = useCallback((phaseDuration) => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
    phaseTimerRef.current = setTimeout(() => {
      setPhaseIndex(prev => prev + 1);
    }, phaseDuration * 1000);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isActive) {
      clearTimers();
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          setIsCompleted(true);
          clearTimers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isActive, clearTimers]);

  // Phase change effect - handles animation and scheduling
  useEffect(() => {
    if (!isActive) return;

    const phase = pattern.phases[phaseIndex % pattern.phases.length];
    
    // Set animation parameters
    if (phase.name === 'hold') {
      setAnimationDuration(0);
    } else {
      setAnimationDuration(phase.duration);
    }
    setTargetScale(phase.scale);

    // Schedule next phase transition
    scheduleNextPhase(phase.duration);

    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [isActive, phaseIndex, pattern.phases, scheduleNextPhase]);

  const handleStart = () => {
    clearTimers();
    const firstPhase = pattern.phases[0];
    setTargetScale(firstPhase.scale);
    setAnimationDuration(firstPhase.duration);
    setPhaseIndex(0);
    setTimeRemaining(pattern.totalDuration);
    setIsCompleted(false);
    setIsActive(true);
  };

  const handleStop = () => {
    clearTimers();
    setIsActive(false);
    setPhaseIndex(0);
    setTimeRemaining(0);
    setTargetScale(1);
  };

  const handleComplete = () => {
    handleStop();
    setIsCompleted(false);
    onComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCircleText = () => {
    if (!isActive) return '';
    if (currentPhase.name === 'in') return 'In';
    if (currentPhase.name === 'out') return 'Out';
    return 'Hold';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center py-8">
        <motion.div
          onClick={() => !isActive && !isCompleted && handleStart()}
          animate={{
            scale: isActive ? targetScale : 1,
          }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
          className={`w-28 h-28 rounded-full bg-white/[0.05] border-2 border-white/[0.2] flex items-center justify-center ${
            !isActive && !isCompleted ? 'cursor-pointer hover:border-white/[0.3] transition-all' : ''
          }`}
          data-testid="breathing-circle"
        >
          <span className="text-lg font-semibold text-white" data-testid="breathing-phase-text">
            {!isActive && !isCompleted ? 'Begin' : getCircleText()}
          </span>
        </motion.div>

        {isActive && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-2xl font-bold text-white"
            data-testid="breathing-timer"
          >
            {formatTime(timeRemaining)}
          </motion.p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Steps:</p>
        <ol className="list-decimal list-inside space-y-2">
          {tool.steps.map((step, i) => (
            <motion.li
              key={i}
              animate={{
                color: isActive && i === currentPhase.stepIndex ? '#F5F5F5' : 'rgba(255,255,255,0.5)',
                fontWeight: isActive && i === currentPhase.stepIndex ? 600 : 400,
                scale: isActive && i === currentPhase.stepIndex ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="text-sm leading-relaxed"
            >
              {step}
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {isCompleted && (
          <Button
            data-testid={`breathing-complete-${tool.id}`}
            onClick={handleComplete}
            className="flex-1 bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl"
          >
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Complete
          </Button>
        )}

        {isActive && (
          <Button
            onClick={handleStop}
            variant="outline"
            data-testid="breathing-stop-button"
            className="flex-1 h-12 rounded-xl border-white/[0.15] text-white hover:bg-white/[0.05]"
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;
