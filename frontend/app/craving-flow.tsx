import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { cravingAPI } from '../src/lib/api';

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
  { id: 'distract', label: 'Distract myself', icon: 'flash', description: 'Focus on something else', color: '#C4785C' },
  { id: 'calm', label: 'Calm down', icon: 'heart', description: 'Reduce anxiety and stress', color: '#4A7C59' },
  { id: 'support', label: 'Get support', icon: 'people', description: 'Connect with someone', color: '#5B8DB8' },
  { id: 'escape', label: 'Get out of here', icon: 'exit', description: 'Change my environment', color: '#9B7BB8' },
  { id: 'reflect', label: 'Reflect', icon: 'bulb', description: 'Process my feelings', color: '#B8A07B' },
];

export default function CravingFlow() {
  const [step, setStep] = useState(1);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [otherTrigger, setOtherTrigger] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSessionStartTime(new Date().toISOString());
  }, []);

  const toggleTrigger = (trigger: string) => {
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
      await cravingAPI.createSession({
        triggers,
        intensity,
        need_type: selectedNeed,
        started_at: sessionStartTime,
      });
      
      Alert.alert('Craving Recorded', "Let's work through this together.");
      
      // Navigate to Coping Tools with params
      router.push({
        pathname: '/(tabs)/coping-tools',
        params: { 
          fromCravingFlow: 'true',
          intensity: intensity.toString(),
          needType: selectedNeed || '',
        }
      });
    } catch (error) {
      console.error('Failed to record session:', error);
      // Still navigate even if save fails
      router.push('/(tabs)/coping-tools');
    }
  };

  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i === step ? styles.stepDotActive : styles.stepDotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Craving Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <StepIndicator />

          {/* Step 1: Triggers */}
          {step === 1 && (
            <View>
              <Text style={styles.title}>What's triggered you?</Text>
              <Text style={styles.subtitle}>Select all that apply</Text>

              <View style={styles.triggersContainer}>
                {TRIGGERS.map((trigger) => (
                  <TouchableOpacity
                    key={trigger}
                    style={[
                      styles.triggerItem,
                      selectedTriggers.includes(trigger) && styles.triggerItemSelected,
                    ]}
                    onPress={() => toggleTrigger(trigger)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedTriggers.includes(trigger) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedTriggers.includes(trigger) && (
                        <Ionicons name="checkmark" size={14} color="#0F1115" />
                      )}
                    </View>
                    <Text style={styles.triggerText}>{trigger}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Other (describe)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Something else..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={otherTrigger}
                  onChangeText={setOtherTrigger}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(tabs)/home')}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (selectedTriggers.length === 0 && !otherTrigger.trim()) && styles.buttonDisabled,
                  ]}
                  onPress={() => setStep(2)}
                  disabled={selectedTriggers.length === 0 && !otherTrigger.trim()}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                  <Ionicons name="chevron-forward" size={20} color="#0F1115" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: Intensity */}
          {step === 2 && (
            <View>
              <Text style={styles.title}>How intense is the craving?</Text>
              <Text style={styles.subtitle}>Rate from 1 (mild) to 10 (severe)</Text>

              <View style={styles.intensityContainer}>
                <Text style={styles.intensityNumber}>{intensity}</Text>
              </View>

              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={10}
                  step={1}
                  value={intensity}
                  onValueChange={setIntensity}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>MILD</Text>
                  <Text style={styles.sliderLabel}>SEVERE</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setStep(1)}
                >
                  <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                  <Ionicons name="chevron-forward" size={20} color="#0F1115" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: What do you need? */}
          {step === 3 && (
            <View>
              <Text style={styles.title}>What do you need?</Text>
              <Text style={styles.subtitle}>Choose what feels right</Text>

              <View style={styles.needsContainer}>
                {NEED_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.needItem,
                      selectedNeed === option.id && styles.needItemSelected,
                    ]}
                    onPress={() => setSelectedNeed(option.id)}
                  >
                    <View style={[styles.needIcon, { backgroundColor: `${option.color}20` }]}>
                      <Ionicons name={option.icon as any} size={24} color={option.color} />
                    </View>
                    <View style={styles.needContent}>
                      <Text style={styles.needLabel}>{option.label}</Text>
                      <Text style={styles.needDescription}>{option.description}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedNeed === option.id && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedNeed === option.id && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setStep(2)}
                >
                  <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !selectedNeed && styles.buttonDisabled,
                  ]}
                  onPress={handleRecordAndNavigate}
                  disabled={!selectedNeed}
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                  <Ionicons name="chevron-forward" size={20} color="#0F1115" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  stepDotActive: {
    width: 32,
    backgroundColor: '#FFFFFF',
  },
  stepDotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
  },
  triggersContainer: {
    marginBottom: 24,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  triggerItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  triggerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  intensityContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  intensityNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sliderContainer: {
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  needsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  needItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  needItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  needIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needContent: {
    flex: 1,
  },
  needLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  needDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FFFFFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: '#0F1115',
    borderRadius: 5,
  },
});
