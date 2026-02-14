import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { copingToolsAPI, journalAPI, authAPI } from '../../src/lib/api';

interface CopingTool {
  id: string;
  title: string;
  duration: string;
  steps: string[];
  when_to_use: string;
  is_mandatory: boolean;
}

const MANDATORY_TOOL_IDS = [
  'tool-deep-breathing',
  'tool-box-breathing',
  'tool-grounding',
  'tool-delay-10',
  'tool-change-location'
];

export default function CopingTools() {
  const [tools, setTools] = useState<CopingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [completedTools, setCompletedTools] = useState<string[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const fromCravingFlow = params.fromCravingFlow === 'true';

  useEffect(() => {
    fetchTools();
    fetchUserSettings();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await copingToolsAPI.getTools();
      setTools(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coping tools');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await authAPI.getMe();
      setUserSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch user settings');
    }
  };

  const handleComplete = async (toolId: string, toolTitle: string) => {
    const newCompletedTools = [...completedTools, toolId];
    setCompletedTools(newCompletedTools);
    setExpandedTool(null);
    Alert.alert('Success', 'Exercise completed!');

    // Check if all mandatory tools are completed
    if (fromCravingFlow) {
      const mandatoryCompleted = MANDATORY_TOOL_IDS.every(id => 
        newCompletedTools.includes(id)
      );

      if (mandatoryCompleted) {
        try {
          const toolNames = tools
            .filter(t => newCompletedTools.includes(t.id))
            .map(t => t.title);

          await journalAPI.createEntry({
            had_craving: true,
            triggers: [],
            intensity: 5,
            tools_used: toolNames,
            outcome: 'resisted',
            notes: `Completed coping session. Tools used: ${toolNames.join(', ')}`
          });

          Alert.alert('Session Complete', 'Your session has been saved to your journal!');
        } catch (error) {
          console.error('Failed to save session:', error);
        }
      }
    }
  };

  const handleCallSupport = () => {
    if (userSettings?.emergency_contact_phone) {
      Linking.openURL(`tel:${userSettings.emergency_contact_phone}`);
    } else {
      Alert.alert('No Contact', 'No support contact set. Add one in Settings.');
    }
  };

  const handleCallSponsor = () => {
    if (userSettings?.sponsor_phone) {
      Linking.openURL(`tel:${userSettings.sponsor_phone}`);
    } else {
      Alert.alert('No Contact', 'No sponsor contact set. Add one in Settings.');
    }
  };

  const getMandatoryProgress = () => {
    const completed = MANDATORY_TOOL_IDS.filter(id => completedTools.includes(id)).length;
    return { completed, total: MANDATORY_TOOL_IDS.length };
  };

  const isMandatory = (tool: CopingTool) => MANDATORY_TOOL_IDS.includes(tool.id);
  const isComplete = (toolId: string) => completedTools.includes(toolId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  const progress = getMandatoryProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coping Tools</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Banner (shown when from craving flow) */}
        {fromCravingFlow && (
          <View style={styles.progressBanner}>
            <Text style={styles.progressTitle}>Recommended Tools</Text>
            <Text style={styles.progressSubtitle}>
              Complete the required exercises to manage your craving.
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarLabels}>
                <Text style={styles.progressBarText}>Progress</Text>
                <Text style={styles.progressBarText}>{progress.completed}/{progress.total} completed</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${(progress.completed / progress.total) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Tools List */}
        <View style={styles.toolsList}>
          {tools.map((tool, index) => (
            <View key={tool.id} style={styles.toolCard}>
              <TouchableOpacity
                style={[
                  styles.toolHeader,
                  isMandatory(tool) && !isComplete(tool.id) && styles.toolHeaderMandatory,
                  isComplete(tool.id) && styles.toolHeaderComplete,
                ]}
                onPress={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
              >
                <View style={styles.toolHeaderContent}>
                  <View style={styles.toolTitleRow}>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    {isComplete(tool.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#4A7C59" />
                    )}
                    {isMandatory(tool) && !isComplete(tool.id) && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredBadgeText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.toolDuration}>{tool.duration}</Text>
                  <Text style={styles.toolWhenToUse}>{tool.when_to_use}</Text>
                </View>
                <Ionicons 
                  name={expandedTool === tool.id ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="rgba(255,255,255,0.4)" 
                />
              </TouchableOpacity>

              {expandedTool === tool.id && (
                <View style={styles.toolContent}>
                  {tool.title.includes('Reach Out') ? (
                    <View style={styles.reachOutButtons}>
                      <TouchableOpacity 
                        style={styles.callButton} 
                        onPress={handleCallSupport}
                      >
                        <Ionicons name="call" size={20} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>Contact My Support</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.callButton, styles.callButtonSponsor]} 
                        onPress={handleCallSponsor}
                      >
                        <Ionicons name="people" size={20} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>Contact My Sponsor</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.callButton, styles.callButtonNA]}
                        onPress={() => Linking.openURL('https://www.na.org/meetingsearch/')}
                      >
                        <Ionicons name="location" size={20} color="#FFFFFF" />
                        <Text style={styles.callButtonText}>Find NA Meeting</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.stepsTitle}>Steps:</Text>
                      {tool.steps.map((step, stepIndex) => (
                        <Text key={stepIndex} style={styles.stepText}>
                          {stepIndex + 1}. {step}
                        </Text>
                      ))}
                    </>
                  )}

                  {!isComplete(tool.id) && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={() => handleComplete(tool.id, tool.title)}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBanner: {
    backgroundColor: '#2A1E1B',
    borderWidth: 1,
    borderColor: '#6B4A3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  progressSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4A7C59',
    borderRadius: 4,
  },
  toolsList: {
    gap: 12,
    paddingBottom: 24,
  },
  toolCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
  },
  toolHeaderMandatory: {
    borderLeftWidth: 3,
    borderLeftColor: '#C4785C',
  },
  toolHeaderComplete: {
    borderLeftWidth: 3,
    borderLeftColor: '#4A7C59',
  },
  toolHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requiredBadge: {
    backgroundColor: 'rgba(196,120,92,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredBadgeText: {
    fontSize: 11,
    color: '#C4785C',
    fontWeight: '500',
  },
  toolDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C4785C',
    marginBottom: 4,
  },
  toolWhenToUse: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
  toolContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: 0,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 16,
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 24,
    marginBottom: 4,
  },
  reachOutButtons: {
    gap: 12,
    marginTop: 16,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B8DB8',
    height: 56,
    borderRadius: 12,
    gap: 12,
  },
  callButtonSponsor: {
    backgroundColor: '#4A7C59',
  },
  callButtonNA: {
    backgroundColor: '#9B7BB8',
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7C59',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
