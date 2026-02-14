import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, CheckCircle2, Star, Phone, Users, MapPin, ExternalLink } from 'lucide-react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import BreathingExercise from '@/components/BreathingExercise';
import GroundingExercise from '@/components/GroundingExercise';
import DelayExercise from '@/components/DelayExercise';
import LocationChangeExercise from '@/components/LocationChangeExercise';
import { copingToolsAPI, journalAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';

// Tool recommendations based on need type
const NEED_TOOL_MAPPING = {
  distract: ['tool-grounding', 'tool-cold-water', 'tool-short-walk'],
  calm: ['tool-deep-breathing', 'tool-box-breathing', 'tool-delay-10'],
  support: ['tool-reach-out'],
  escape: ['tool-change-location', 'tool-short-walk'],
  reflect: ['tool-grounding', 'tool-craving-surfing'],
};

const CopingTools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openTool, setOpenTool] = useState(null);
  const [completedTools, setCompletedTools] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from craving flow
  const fromCravingFlow = location.state?.fromCravingFlow;
  const cravingIntensity = location.state?.intensity;
  const needType = location.state?.needType;
  const sessionId = location.state?.sessionId;

  // Get recommended tools based on need type
  const recommendedToolIds = needType ? NEED_TOOL_MAPPING[needType] || [] : [];

  // Mandatory tool IDs when coming from craving flow
  const MANDATORY_TOOL_IDS = [
    'tool-deep-breathing',
    'tool-box-breathing',
    'tool-grounding',
    'tool-delay-10',
    'tool-change-location'
  ];

  useEffect(() => {
    fetchTools();
    fetchUserSettings();
    
    // Initialize session data if coming from craving flow
    if (fromCravingFlow) {
      setSessionData({
        startedAt: new Date().toISOString(),
        intensity: cravingIntensity,
        needType: needType,
        toolsCompleted: [],
        sessionId: sessionId
      });
    }
  }, [fromCravingFlow, cravingIntensity, needType, sessionId]);

  const fetchTools = async () => {
    try {
      const response = await copingToolsAPI.getTools();
      setTools(response.data);
    } catch (error) {
      toast.error('Failed to load coping tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await userAPI.getSettings();
      setUserSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  const handleComplete = async (toolId, toolTitle, extraData = {}) => {
    const newCompletedTools = [...completedTools, toolId];
    setCompletedTools(newCompletedTools);
    setOpenTool(null);
    toast.success('Exercise completed!');

    // Update session data
    if (sessionData) {
      const updatedSessionData = {
        ...sessionData,
        toolsCompleted: [
          ...sessionData.toolsCompleted,
          {
            toolId,
            toolTitle,
            completedAt: new Date().toISOString(),
            ...extraData
          }
        ]
      };
      setSessionData(updatedSessionData);

      // Check if all mandatory tools are completed
      const mandatoryCompleted = MANDATORY_TOOL_IDS.every(id => 
        newCompletedTools.includes(id)
      );

      if (mandatoryCompleted && fromCravingFlow) {
        // Save session to journal
        await saveSessionToJournal(updatedSessionData, newCompletedTools);
      }
    }
  };

  const handleMarkAsComplete = (toolId, toolTitle) => {
    // For optional tools, allow manual completion
    handleComplete(toolId, toolTitle, { manuallyCompleted: true });
  };

  const saveSessionToJournal = async (data, completedToolIds) => {
    try {
      const toolNames = tools
        .filter(t => completedToolIds.includes(t.id))
        .map(t => t.title);

      await journalAPI.createEntry({
        had_craving: true,
        triggers: [],
        intensity: data.intensity,
        tools_used: toolNames,
        outcome: 'resisted',
        notes: `Completed coping session. Tools used: ${toolNames.join(', ')}`
      });

      toast.success('Session saved to journal!');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const isBreathingTool = (tool) => {
    return tool.title.includes('Deep Breathing') || tool.title.includes('Box Breathing');
  };

  const isGroundingTool = (tool) => {
    return tool.title === 'Grounding';
  };

  const isDelayTool = (tool) => {
    return tool.title.includes('Delay 10');
  };

  const isLocationTool = (tool) => {
    return tool.title.includes('Change Your Location');
  };

  const isReachOutTool = (tool) => {
    return tool.title.includes('Reach Out');
  };

  const isMandatory = (tool) => {
    return fromCravingFlow && MANDATORY_TOOL_IDS.includes(tool.id);
  };

  const isRecommended = (tool) => {
    return recommendedToolIds.includes(tool.id);
  };

  const getMandatoryProgress = () => {
    const mandatoryCompleted = MANDATORY_TOOL_IDS.filter(id => 
      completedTools.includes(id)
    ).length;
    return {
      completed: mandatoryCompleted,
      total: MANDATORY_TOOL_IDS.length
    };
  };

  // Get need type label for display
  const getNeedTypeLabel = () => {
    const labels = {
      distract: 'Distraction',
      calm: 'Calming',
      support: 'Support',
      escape: 'Environment Change',
      reflect: 'Reflection'
    };
    return labels[needType] || '';
  };

  // Sort tools: recommended first, then mandatory, then others
  const sortedTools = [...tools].sort((a, b) => {
    const aIsRecommended = isRecommended(a);
    const bIsRecommended = isRecommended(b);
    const aIsMandatory = MANDATORY_TOOL_IDS.includes(a.id);
    const bIsMandatory = MANDATORY_TOOL_IDS.includes(b.id);
    
    // Recommended tools first
    if (aIsRecommended && !bIsRecommended) return -1;
    if (!aIsRecommended && bIsRecommended) return 1;
    
    // Then mandatory tools
    if (aIsMandatory && !bIsMandatory) return -1;
    if (!aIsMandatory && bIsMandatory) return 1;
    
    return 0;
  });

  // Handle phone call to support
  const handleCallSupport = () => {
    if (userSettings?.emergencyContactPhone) {
      window.location.href = `tel:${userSettings.emergencyContactPhone}`;
    } else {
      toast.error('No support contact set. Add one in Settings.');
    }
  };

  // Handle phone call to sponsor
  const handleCallSponsor = () => {
    if (userSettings?.sponsorPhone) {
      window.location.href = `tel:${userSettings.sponsorPhone}`;
    } else if (userSettings?.emergencyContactPhone) {
      // Fallback to emergency contact if no sponsor
      window.location.href = `tel:${userSettings.emergencyContactPhone}`;
    } else {
      toast.error('No sponsor contact set. Add one in Settings.');
    }
  };

  // Open NA meeting finder
  const handleFindNAMeeting = () => {
    window.open('https://www.na.org/meetingsearch/', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  const progress = getMandatoryProgress();

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Header with Back/Forward Navigation */}
        <TopNav title="Coping Tools" />
        
        {/* Show message and recommendations if coming from craving flow */}
        {fromCravingFlow && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2A1E1B] border border-[#6B4A3B] rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-white font-medium mb-2">
              Recommended for {getNeedTypeLabel()}
            </p>
            <p className="text-xs text-white/60 mb-3">
              Your craving has been recorded. The highlighted tools below are recommended based on your needs.
            </p>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Progress</span>
                <span>{progress.completed}/{progress.total} completed</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  className="h-full bg-[#4A7C59] rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {progress.completed === progress.total && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-3 bg-[#4A7C59]/20 border border-[#4A7C59]/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
                  <p className="text-sm text-[#4A7C59] font-medium">
                    All required exercises completed! Session saved to journal.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="space-y-3">
          {sortedTools.map((tool, index) => {
            const mandatory = isMandatory(tool);
            const recommended = isRecommended(tool);
            const isComplete = completedTools.includes(tool.id);
            const isOptional = fromCravingFlow && !mandatory;

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`coping-tool-${index}`}
              >
                <Collapsible
                  open={openTool === tool.id}
                  onOpenChange={(isOpen) => {
                    setOpenTool(isOpen ? tool.id : null);
                  }}
                >
                  <div className={`bg-white/[0.03] border rounded-xl overflow-hidden ${
                    recommended && !isComplete
                      ? 'border-[#5B8DB8]/60 bg-[#5B8DB8]/[0.08]'
                      : mandatory && !isComplete 
                        ? 'border-[#C4785C]/50' 
                        : isComplete 
                          ? 'border-[#4A7C59]/50' 
                          : 'border-white/[0.08]'
                  }`}>
                    <CollapsibleTrigger 
                      className="w-full"
                      disabled={openTool !== null && openTool !== tool.id}
                    >
                      <div className={`p-5 flex items-start justify-between transition-colors cursor-pointer ${
                        openTool !== null && openTool !== tool.id 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-white/[0.02]'
                      }`}>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">
                              {tool.title}
                            </h3>
                            {isComplete && (
                              <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
                            )}
                            {recommended && !isComplete && (
                              <span className="text-xs bg-[#5B8DB8]/20 text-[#5B8DB8] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Recommended
                              </span>
                            )}
                            {mandatory && !isComplete && !recommended && (
                              <span className="text-xs bg-[#C4785C]/20 text-[#C4785C] px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                            {isOptional && !recommended && (
                              <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#C4785C] font-medium mb-1">{tool.duration}</p>
                          <p className="text-sm text-white/40 italic">{tool.when_to_use}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <motion.div
                            animate={{ rotate: openTool === tool.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-white/40" />
                          </motion.div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-5 pb-5 border-t border-white/[0.08] pt-4">
                        {isBreathingTool(tool) ? (
                          <BreathingExercise 
                            tool={tool} 
                            onComplete={() => handleComplete(tool.id, tool.title)}
                          />
                        ) : isGroundingTool(tool) ? (
                          <GroundingExercise 
                            tool={tool} 
                            onComplete={() => handleComplete(tool.id, tool.title)}
                          />
                        ) : isDelayTool(tool) ? (
                          <DelayExercise 
                            tool={tool} 
                            onComplete={() => handleComplete(tool.id, tool.title)}
                          />
                        ) : isLocationTool(tool) ? (
                          <LocationChangeExercise 
                            tool={tool} 
                            onComplete={(data) => handleComplete(tool.id, tool.title, data)}
                          />
                        ) : isReachOutTool(tool) ? (
                          <div className="space-y-4">
                            {/* Contact My Support Button */}
                            <Button
                              onClick={handleCallSupport}
                              data-testid="contact-support-button"
                              className="w-full bg-[#5B8DB8] hover:bg-[#4A7CA7] text-white h-14 rounded-xl flex items-center justify-center gap-3"
                            >
                              <Phone className="w-5 h-5" />
                              <div className="text-left">
                                <span className="font-semibold">Contact My Support</span>
                                {userSettings?.emergencyContactPhone && (
                                  <p className="text-xs text-white/70">{userSettings.emergencyContactPhone}</p>
                                )}
                              </div>
                            </Button>

                            {/* Contact My Sponsor Button */}
                            <Button
                              onClick={handleCallSponsor}
                              data-testid="contact-sponsor-button"
                              className="w-full bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-14 rounded-xl flex items-center justify-center gap-3"
                            >
                              <Users className="w-5 h-5" />
                              <div className="text-left">
                                <span className="font-semibold">Contact My Sponsor</span>
                                {userSettings?.sponsorPhone && (
                                  <p className="text-xs text-white/70">{userSettings.sponsorPhone}</p>
                                )}
                              </div>
                            </Button>

                            {/* Find NA Meeting Button */}
                            <Button
                              onClick={handleFindNAMeeting}
                              data-testid="find-na-meeting-button"
                              className="w-full bg-[#9B7BB8] hover:bg-[#8A6AA7] text-white h-14 rounded-xl flex items-center justify-center gap-3"
                            >
                              <MapPin className="w-5 h-5" />
                              <span className="font-semibold">Find NA Meeting</span>
                              <ExternalLink className="w-4 h-4 ml-auto" />
                            </Button>

                            <div className="pt-2">
                              <p className="text-sm font-medium text-white mb-2">Steps:</p>
                              <ol className="list-decimal list-inside space-y-2">
                                {tool.steps.map((step, i) => (
                                  <li key={i} className="text-sm leading-relaxed text-white/60">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-white mb-2">Steps:</p>
                              <ol className="list-decimal list-inside space-y-2">
                                {tool.steps.map((step, i) => (
                                  <li key={i} className="text-sm leading-relaxed text-white/60">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                        
                        {/* TEMPORARY: Allow all tools to be marked as complete manually */}
                        {/* TODO: Revert this - only optional tools should have manual completion */}
                        {!isComplete && (
                          <Button
                            onClick={() => handleMarkAsComplete(tool.id, tool.title)}
                            data-testid={`mark-complete-${tool.id}`}
                            className="w-full bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl mt-4"
                          >
                            <CheckCircle2 className="mr-2 w-5 h-5" />
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CopingTools;
