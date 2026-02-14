import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, MapPin, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authAPI, cravingAPI } from '@/lib/api';
import { toast } from 'sonner';

// Personalized guidance based on intensity and need type
const getGuidanceSteps = (intensity, needType) => {
  const intensityLevel = intensity <= 3 ? 'low' : intensity <= 6 ? 'medium' : 'high';
  
  const guidance = {
    low: {
      distract: [
        "This is manageable. You're in control.",
        "Think about a hobby or activity you enjoy.",
        "Put on music or a podcast you like.",
        "Call a friend and have a casual conversation.",
        "The craving is mild - you can redirect your attention.",
        "List three things you're grateful for today.",
        "Do something creative or productive.",
        "You're handling this well. Keep going.",
        "Notice how the intensity is already decreasing.",
        "Almost there. You've got this."
      ],
      calm: [
        "Take slow, deep breaths. You're safe.",
        "Your body is tense. Relax your shoulders.",
        "Notice where you feel anxiety. Breathe into it.",
        "This feeling will pass. You're okay.",
        "Count backwards from 100 by 7s.",
        "Progressive muscle relaxation: tense and release.",
        "You're calmer now than a minute ago.",
        "Feel your feet on the ground. You're present.",
        "The craving is losing its power.",
        "Well done. You stayed calm and present."
      ],
      support: [
        "You're not alone in this.",
        "Reach out to someone if you need to.",
        "Your support network is there for you.",
        "Think of someone who believes in you.",
        "Remember why you started recovery.",
        "You've overcome cravings before.",
        "This community has your back.",
        "You're stronger with support.",
        "Almost through. You're doing great.",
        "You made it. That's a victory."
      ],
      leave: [
        "Good instinct to change your environment.",
        "Step outside if you can.",
        "Move to a different room.",
        "Physical distance helps.",
        "Walk around the block.",
        "Fresh air can help reset.",
        "You're removing yourself from triggers.",
        "The change of scenery is working.",
        "You're almost there.",
        "You did the right thing by leaving."
      ],
      reflect: [
        "Take a moment to understand this craving.",
        "What triggered this feeling?",
        "How do you really want to feel?",
        "What would using give you? What would it take away?",
        "Think about your recovery goals.",
        "Visualize yourself tomorrow, craving-free.",
        "You're gaining insight into your patterns.",
        "This reflection is powerful.",
        "You're almost through this.",
        "You chose wisdom over impulse. Well done."
      ]
    },
    medium: {
      distract: [
        "This is challenging, but you can handle it.",
        "Get up and move. Physical activity helps.",
        "Do 20 jumping jacks or push-ups.",
        "Call someone and talk about anything else.",
        "Watch a funny video or show.",
        "Clean or organize something small.",
        "The intensity is peaking. It will decrease.",
        "You're halfway through. Keep distracting.",
        "You're doing better than you think.",
        "Almost there. You're winning this battle."
      ],
      calm: [
        "This is intense, but you can calm it.",
        "Box breathing: 4-4-4-4. Do it now.",
        "Splash cold water on your face.",
        "Put ice cubes in your hands.",
        "The physical sensation will help.",
        "You're managing this intensity.",
        "Past the peak. It's getting easier.",
        "Your calm is returning.",
        "You're stronger than this craving.",
        "You made it through. Proud of you."
      ],
      support: [
        "This is tough. You might need to reach out.",
        "Text or call your sponsor now if needed.",
        "You don't have to do this alone.",
        "Think of the people who care about you.",
        "They want you to succeed.",
        "You're fighting for your life right now.",
        "Every second you resist matters.",
        "You're not alone in this struggle.",
        "The craving is weakening.",
        "You stayed strong. That's huge."
      ],
      leave: [
        "Change your location NOW.",
        "Leave the space you're in immediately.",
        "Go somewhere public if possible.",
        "Call someone as you're moving.",
        "Distance yourself from any triggers.",
        "Keep moving. Don't stop yet.",
        "The environment change is helping.",
        "You're in a safer space now.",
        "Almost clear of this.",
        "You protected yourself. Good work."
      ],
      reflect: [
        "Pause and really feel this craving.",
        "What's beneath the surface? Fear? Pain?",
        "Using won't solve the real problem.",
        "What healthy choice can you make instead?",
        "Think of your biggest reason for recovery.",
        "Imagine yourself one year sober.",
        "This moment will define your day.",
        "You're choosing long-term over short-term.",
        "The clarity is coming.",
        "You thought through it. You're free."
      ]
    },
    high: {
      distract: [
        "This is severe. Focus on ANYTHING else.",
        "Do intense physical activity NOW.",
        "Run in place, do burpees, anything.",
        "Scream into a pillow if you need to.",
        "Break the craving's hold with action.",
        "Call someone immediately and talk.",
        "Watch something engaging, volume up.",
        "The peak is passing. You're surviving.",
        "Second by second. You're doing it.",
        "You made it. That took real strength."
      ],
      calm: [
        "BREATHE. Right now. Deep and slow.",
        "Ice water NOW. Drink or splash your face.",
        "Hold ice cubes. Focus on the sensation.",
        "Lie down and do progressive relaxation.",
        "Your survival brain is activated. Calm it.",
        "You will NOT die from this craving.",
        "The intensity is temporary. You're okay.",
        "Past the worst part. Keep breathing.",
        "You're safe. The craving is passing.",
        "You survived something hard. You're a warrior."
      ],
      support: [
        "CALL YOUR SPONSOR RIGHT NOW.",
        "Do not be alone with this craving.",
        "Text your support group immediately.",
        "Go to someone's house or a meeting.",
        "This is what sponsors are for.",
        "Use every support resource you have.",
        "You're in danger. Get help now.",
        "Stay on the phone with someone.",
        "The connection is saving you.",
        "You reached out. That's victory."
      ],
      leave: [
        "GET OUT NOW. Leave immediately.",
        "Go to a public place with people.",
        "Drive to a meeting or friend's house.",
        "Do NOT stay where you are.",
        "Physical distance is CRITICAL.",
        "Keep moving until you're safe.",
        "Stay in the new location.",
        "The distance is working.",
        "You removed yourself from danger.",
        "You saved your own life by leaving."
      ],
      reflect: [
        "STOP. This is the moment of choice.",
        "Using will destroy everything you've built.",
        "Think of the people who love you.",
        "You will regret using. You know this.",
        "The pain is temporary. Relapse is worse.",
        "What's worth more: this moment or your life?",
        "You've come too far to go back.",
        "Choose life. Choose recovery. Right now.",
        "The moment is passing. You're still here.",
        "You didn't use. You won. You're free."
      ]
    }
  };

  return guidance[intensityLevel][needType] || guidance.medium.calm;
};

const TimerSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, intensity = 5, needType = 'calm' } = location.state || {};

  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [guidanceSteps, setGuidanceSteps] = useState([]);

  // Load session from localStorage if it exists
  useEffect(() => {
    const savedSession = localStorage.getItem(`session-${sessionId}`);
    if (savedSession) {
      const { timeLeft: savedTime, currentStep: savedStep } = JSON.parse(savedSession);
      if (savedTime > 0) {
        setTimeLeft(savedTime);
        setCurrentStep(savedStep);
        toast.info('Resumed your session');
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/home');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await authAPI.getMe();
        setUser(userRes.data);
        
        const steps = getGuidanceSteps(intensity, needType);
        setGuidanceSteps(steps);
        
        if (timeLeft === 0) {
          setTimeLeft(userRes.data.timer_minutes * 60);
        }
      } catch (error) {
        toast.error('Failed to load session');
      }
    };

    fetchData();
  }, [sessionId, navigate, intensity, needType]);

  // Save session to localStorage periodically
  useEffect(() => {
    if (timeLeft > 0 && sessionId) {
      localStorage.setItem(`session-${sessionId}`, JSON.stringify({
        timeLeft,
        currentStep,
        sessionId,
        intensity,
        needType
      }));
    }
  }, [timeLeft, currentStep, sessionId, intensity, needType]);

  useEffect(() => {
    if (timeLeft <= 0 || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        // Update guidance step based on time
        if (user) {
          const totalTime = user.timer_minutes * 60;
          const elapsed = totalTime - newTime;
          const stepDuration = totalTime / guidanceSteps.length;
          const newStep = Math.min(Math.floor(elapsed / stepDuration), guidanceSteps.length - 1);
          
          if (newStep !== currentStep) {
            setCurrentStep(newStep);
          }
        }

        if (newTime <= 0) {
          setIsComplete(true);
          localStorage.removeItem(`session-${sessionId}`);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isComplete, user, guidanceSteps, currentStep, sessionId]);

  const handleComplete = async (outcome) => {
    try {
      await cravingAPI.completeSession(sessionId, { outcome });
      localStorage.removeItem(`session-${sessionId}`);
      toast.success(outcome === 'resisted' ? 'Well done! Stay strong.' : 'Thank you for being honest.');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to save session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#4A7C59]/20 border border-[#4A7C59]/30 rounded-xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#7AB889]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
            You Made It!
          </h2>
          <p className="text-base leading-relaxed text-white/50 mb-8">
            Take a moment to acknowledge your strength. You chose recovery today.
          </p>

          <div className="space-y-3">
            <Button
              data-testid="timer-complete-resisted"
              onClick={() => handleComplete('resisted')}
              className="w-full bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
            >
              I Resisted
            </Button>
            <Button
              data-testid="timer-complete-partial"
              onClick={() => handleComplete('partial')}
              variant="outline"
              className="w-full h-12 rounded-xl border-white/[0.15] text-white hover:bg-white/[0.05]"
            >
              Partially Resisted
            </Button>
            <Button
              data-testid="timer-complete-used"
              onClick={() => handleComplete('used')}
              variant="ghost"
              className="w-full h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05]"
            >
              I Used
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((user.timer_minutes * 60 - timeLeft) / (user.timer_minutes * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#0F1115] p-5 pb-24 relative z-10">
      <div className="max-w-md mx-auto pt-6">
        {/* Timer display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 mb-6 text-center"
        >
          <div className="relative w-44 h-44 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="80"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="88"
                cy="88"
                r="80"
                stroke="#F5F5F5"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-white" data-testid="timer-display">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Panic Button */}
          <Button
            data-testid="panic-button"
            onClick={() => setIsPanicModalOpen(true)}
            className="w-full h-12 rounded-xl bg-[#2A1E1B] border border-[#6B4A3B] hover:bg-[#352520] text-[#C4785C] mb-4"
          >
            <AlertTriangle className="mr-2 w-5 h-5" />
            I Need Help Now
          </Button>
        </motion.div>

        {/* Next Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6"
            data-testid="guidance-card"
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Next Step
            </h3>
            <p className="text-lg leading-relaxed text-white font-medium">
              {guidanceSteps[currentStep]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Panic Modal */}
      <Dialog open={isPanicModalOpen} onOpenChange={setIsPanicModalOpen}>
        <DialogContent className="max-w-sm bg-[#1A1D22] border-white/[0.1]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Emergency Support</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-[#2A1E1B] border border-[#6B4A3B] rounded-xl p-4">
              <p className="text-sm leading-relaxed text-white/70">
                <strong className="text-[#C4785C]">Safety Notice:</strong> This app is support, not medical care. If you're in immediate danger, call emergency services or a crisis hotline.
              </p>
            </div>

            {user.sponsor_phone && (
              <>
                <Button
                  data-testid="panic-call-sponsor"
                  onClick={() => window.location.href = `tel:${user.sponsor_phone}`}
                  className="w-full h-12 rounded-xl bg-white text-[#0F1115] hover:bg-white/90"
                >
                  <Phone className="mr-3 w-5 h-5" />
                  Call {user.sponsor_name || 'Sponsor'}
                </Button>
                <Button
                  data-testid="panic-text-sponsor"
                  onClick={() => window.location.href = `sms:${user.sponsor_phone}`}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-white/[0.15] text-white hover:bg-white/[0.05]"
                >
                  <MessageSquare className="mr-3 w-5 h-5" />
                  Text {user.sponsor_name || 'Sponsor'}
                </Button>
              </>
            )}

            <Button
              data-testid="panic-find-meeting"
              onClick={() => window.open('https://www.na.org/meetingsearch/', '_blank')}
              variant="outline"
              className="w-full h-12 rounded-xl border-white/[0.15] text-white hover:bg-white/[0.05]"
            >
              <MapPin className="mr-3 w-5 h-5" />
              Find NA Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimerSession;
