import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { journalAPI } from '../src/lib/api';

const TRIGGERS = [
  'Boredom', 'Loneliness', 'Stress', 'Anger', 'Anxiety', 
  'Sadness', 'Celebration', 'Social Pressure', 'Seeing Content/People'
];

const TOOLS = [
  'Deep Breathing', 'Box Breathing', 'Grounding', 
  'Delay 10 Minutes', 'Change Your Location', 'Short Walk', 
  'Cold Water Reset', 'Reach Out'
];

const OUTCOMES = [
  { id: 'resisted', label: 'Resisted', color: '#4A7C59' },
  { id: 'partial', label: 'Partial', color: '#B8A07B' },
  { id: 'used', label: 'Used', color: '#C4785C' },
];

export default function JournalAdd() {
  const [hadCraving, setHadCraving] = useState(true);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await journalAPI.createEntry({
        had_craving: hadCraving,
        triggers: selectedTriggers,
        intensity: hadCraving ? intensity : null,
        tools_used: selectedTools,
        outcome: hadCraving ? outcome : null,
        notes,
      });
      Alert.alert('Success', 'Journal entry saved!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Entry Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entry Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, hadCraving && styles.typeButtonActive]}
              onPress={() => setHadCraving(true)}
            >
              <Text style={[styles.typeButtonText, hadCraving && styles.typeButtonTextActive]}>
                Had a Craving
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, !hadCraving && styles.typeButtonActive]}
              onPress={() => setHadCraving(false)}
            >
              <Text style={[styles.typeButtonText, !hadCraving && styles.typeButtonTextActive]}>
                Daily Check-in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {hadCraving && (
          <>
            {/* Triggers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Triggers</Text>
              <View style={styles.tagsContainer}>
                {TRIGGERS.map((trigger) => (
                  <TouchableOpacity
                    key={trigger}
                    style={[
                      styles.tag,
                      selectedTriggers.includes(trigger) && styles.tagSelected,
                    ]}
                    onPress={() => toggleTrigger(trigger)}
                  >
                    <Text style={[
                      styles.tagText,
                      selectedTriggers.includes(trigger) && styles.tagTextSelected,
                    ]}>
                      {trigger}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intensity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intensity: {intensity}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor="#C4785C"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbTintColor="#FFFFFF"
              />
            </View>

            {/* Outcome */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Outcome</Text>
              <View style={styles.outcomeButtons}>
                {OUTCOMES.map((o) => (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.outcomeButton,
                      outcome === o.id && { backgroundColor: `${o.color}30`, borderColor: o.color },
                    ]}
                    onPress={() => setOutcome(o.id)}
                  >
                    <Text style={[
                      styles.outcomeButtonText,
                      outcome === o.id && { color: o.color },
                    ]}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Tools Used */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools Used</Text>
          <View style={styles.tagsContainer}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool}
                style={[
                  styles.tag,
                  styles.tagGreen,
                  selectedTools.includes(tool) && styles.tagGreenSelected,
                ]}
                onPress={() => toggleTool(tool)}
              >
                <Text style={[
                  styles.tagText,
                  styles.tagTextGreen,
                  selectedTools.includes(tool) && styles.tagTextGreenSelected,
                ]}>
                  {tool}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How are you feeling? What helped?"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F1115" />
          ) : (
            <Text style={styles.saveButtonText}>Save Entry</Text>
          )}
        </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  typeButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagSelected: {
    backgroundColor: 'rgba(196,120,92,0.2)',
    borderColor: '#C4785C',
  },
  tagGreen: {
    borderColor: 'rgba(74,124,89,0.3)',
  },
  tagGreenSelected: {
    backgroundColor: 'rgba(74,124,89,0.2)',
    borderColor: '#4A7C59',
  },
  tagText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  tagTextSelected: {
    color: '#C4785C',
  },
  tagTextGreen: {
    color: 'rgba(122,184,137,0.8)',
  },
  tagTextGreenSelected: {
    color: '#7AB889',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  outcomeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  outcomeButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outcomeButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F1115',
  },
});
