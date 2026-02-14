import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock } from 'lucide-react';

const DelayExercise = ({ tool, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes = 600 seconds
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleStart = () => {
    setIsActive(true);
    setTimeRemaining(600);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeRemaining(600);
    onComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((600 - timeRemaining) / 600) * 100;

  return (
    <div className="space-y-6 mt-4">
      {/* Timer Display */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-40 h-40 mb-6">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="72"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="72"
              stroke="#F5F5F5"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 72}`}
              strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock className="w-6 h-6 text-white/50 mb-2" />
            <span 
              className="text-3xl font-bold text-white"
              data-testid="delay-timer-display"
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {isActive && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-white/50 text-center max-w-xs"
          >
            Take this time to do something else. The craving will pass.
          </motion.p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Steps:</p>
        <ol className="list-decimal list-inside space-y-2">
          {tool.steps.map((step, i) => (
            <li key={i} className="text-sm leading-relaxed text-white/50">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isActive && !isCompleted && (
          <Button
            data-testid="delay-start-button"
            onClick={handleStart}
            className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold"
          >
            <Clock className="mr-2 w-5 h-5" />
            Start Timer
          </Button>
        )}

        {isCompleted && (
          <Button
            data-testid="delay-complete-button"
            onClick={handleComplete}
            className="flex-1 bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl"
          >
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Complete
          </Button>
        )}

        {isActive && (
          <Button
            onClick={() => {
              setIsActive(false);
              setTimeRemaining(600);
            }}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-white/[0.15] text-white hover:bg-white/[0.05]"
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};

export default DelayExercise;
