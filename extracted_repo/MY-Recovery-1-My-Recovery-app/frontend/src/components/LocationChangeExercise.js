import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, MapPin, ArrowRight, Play, Clock } from 'lucide-react';

const LocationChangeExercise = ({ tool, onComplete }) => {
  const [fromRoom, setFromRoom] = useState('');
  const [toRoom, setToRoom] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  const canStartTimer = fromRoom.trim().length > 0 && toRoom.trim().length > 0;
  const canComplete = canStartTimer && timeRemaining === 0;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  const handleStartTimer = () => {
    if (!canStartTimer) return;
    setIsTimerActive(true);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete({
      fromRoom,
      toRoom,
      duration: 300 - timeRemaining
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Room Inputs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-white/60 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Which room are you currently in?
          </Label>
          <Input
            data-testid="location-from-room"
            placeholder="e.g., Living room, Bedroom, Office"
            value={fromRoom}
            onChange={(e) => setFromRoom(e.target.value)}
            disabled={isTimerActive || isCompleted}
            className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
          />
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-white/40" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-white/60 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Which room did you move to?
          </Label>
          <Input
            data-testid="location-to-room"
            placeholder="e.g., Kitchen, Bathroom, Outside"
            value={toRoom}
            onChange={(e) => setToRoom(e.target.value)}
            disabled={isTimerActive || isCompleted}
            className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
          />
        </div>
      </div>

      {/* Timer Display */}
      {(isTimerActive || timeRemaining < 300) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-white/60" />
            <span className="text-sm text-white/60">Time remaining in new location</span>
          </div>
          <p className={`text-5xl font-bold ${timeRemaining === 0 ? 'text-[#4A7C59]' : 'text-white'}`}>
            {formatTime(timeRemaining)}
          </p>
          {timeRemaining === 0 && (
            <p className="text-sm text-[#4A7C59] mt-2">Timer complete! You can now mark as completed.</p>
          )}
        </motion.div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Steps:</p>
        <ol className="list-decimal list-inside space-y-2">
          {tool.steps.map((step, i) => (
            <li
              key={i}
              className={`text-sm leading-relaxed ${
                (i === 0 && fromRoom) || 
                (i === 2 && toRoom) || 
                (i === 3 && isTimerActive) ||
                (i === 4 && timeRemaining === 0)
                  ? 'text-white font-medium'
                  : 'text-white/50'
              }`}
            >
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isTimerActive && timeRemaining === 300 && (
          <Button
            data-testid="location-start-timer"
            onClick={handleStartTimer}
            disabled={!canStartTimer}
            className="flex-1 bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold disabled:opacity-30"
          >
            <Play className="mr-2 w-5 h-5" />
            Start 5-Minute Timer
          </Button>
        )}

        {(isTimerActive || timeRemaining < 300) && !isCompleted && (
          <Button
            data-testid="location-complete"
            onClick={handleComplete}
            disabled={!canComplete}
            className="flex-1 bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl disabled:opacity-30"
          >
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Complete
          </Button>
        )}

        {isCompleted && (
          <div className="flex-1 bg-[#4A7C59]/20 border border-[#4A7C59]/30 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-[#4A7C59] mx-auto mb-2" />
            <p className="text-sm text-[#4A7C59] font-medium">Exercise Completed!</p>
            <p className="text-xs text-white/50 mt-1">
              {fromRoom} → {toRoom}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationChangeExercise;
