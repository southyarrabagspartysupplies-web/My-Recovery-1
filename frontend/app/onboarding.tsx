import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import * as Localization from 'expo-localization';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    timezone: Localization.timezone || 'America/New_York',
    sponsor_name: '',
    sponsor_phone: '',
    timer_minutes: 15,
    sobriety_date: '',
  });
  const router = useRouter();
  const { completeOnboarding } = useAuthStore();

  const handleComplete = async () => {
    const result = await completeOnboarding(formData);
    if (result.success) {
      Alert.alert('Welcome!', 'Welcome to MyRecovery!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to complete onboarding');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <StepIndicator />

          {step === 1 && (
            <View>
              <Text style={styles.title}>Important Notice</Text>
              
              <View style={styles.warningBox}>
                <View style={styles.warningContent}>
                  <Ionicons name="warning" size={24} color="#C4785C" />
                  <Text style={styles.warningText}>
                    This app is support, <Text style={styles.warningBold}>not medical care</Text>. If you're in danger or at
                    risk of relapse, contact your sponsor, a trusted person, or emergency services.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Ionicons name="checkmark" size={16} color="#0F1115" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  I understand and agree to use this app as a supplemental support tool
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, !agreed && styles.buttonDisabled]}
                onPress={() => setStep(2)}
                disabled={!agreed}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <Ionicons name="chevron-forward" size={20} color="#0F1115" />
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.title}>Emergency Contact</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={formData.sponsor_name}
                  onChangeText={(text) => setFormData({ ...formData, sponsor_name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={formData.sponsor_phone}
                  onChangeText={(text) => setFormData({ ...formData, sponsor_phone: text })}
                  keyboardType="phone-pad"
                />
                <Text style={styles.helperText}>
                  This will be used for quick access on the home screen.
                </Text>
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
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <Ionicons name="chevron-forward" size={20} color="#0F1115" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.title}>Personalize Your Experience</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Craving Session Length</Text>
                <View style={styles.timerOptions}>
                  {[10, 15, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.timerOption,
                        formData.timer_minutes === mins && styles.timerOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, timer_minutes: mins })}
                    >
                      <Text
                        style={[
                          styles.timerOptionText,
                          formData.timer_minutes === mins && styles.timerOptionTextActive,
                        ]}
                      >
                        {mins} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sobriety Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={formData.sobriety_date}
                  onChangeText={(text) => setFormData({ ...formData, sobriety_date: text })}
                />
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
                  style={styles.primaryButton}
                  onPress={handleComplete}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
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
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#2A1E1B',
    borderWidth: 1,
    borderColor: '#6B4A3B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  warningContent: {
    flexDirection: 'row',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
  },
  warningBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.5)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
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
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  timerOption: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timerOptionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  timerOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
});
