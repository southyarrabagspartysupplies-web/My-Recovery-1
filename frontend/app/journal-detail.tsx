import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { journalAPI } from '../src/lib/api';
import { format } from 'date-fns';

interface JournalEntry {
  id: string;
  created_at: string;
  had_craving: boolean;
  triggers: string[];
  intensity: number | null;
  tools_used: string[];
  outcome: string | null;
  notes: string;
}

export default function JournalDetail() {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;
      try {
        const response = await journalAPI.getEntry(id as string);
        setEntry(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load entry');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal Entry</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>
            {format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.timeText}>
            {format(new Date(entry.created_at), 'h:mm a')}
          </Text>
        </View>

        {/* Entry Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.typeRow}>
            <Ionicons 
              name={entry.had_craving ? 'warning' : 'checkmark-circle'} 
              size={24} 
              color={entry.had_craving ? '#C4785C' : '#4A7C59'} 
            />
            <Text style={styles.typeText}>
              {entry.had_craving ? 'Had a Craving' : 'Daily Check-in'}
            </Text>
          </View>
        </View>

        {/* Outcome (if craving) */}
        {entry.had_craving && entry.outcome && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outcome</Text>
            <View style={[
              styles.outcomeBadge,
              entry.outcome === 'resisted' && styles.outcomeBadgeResisted,
              entry.outcome === 'partial' && styles.outcomeBadgePartial,
              entry.outcome === 'used' && styles.outcomeBadgeUsed,
            ]}>
              <Text style={[
                styles.outcomeBadgeText,
                entry.outcome === 'resisted' && styles.outcomeBadgeTextResisted,
                entry.outcome === 'partial' && styles.outcomeBadgeTextPartial,
                entry.outcome === 'used' && styles.outcomeBadgeTextUsed,
              ]}>
                {entry.outcome.charAt(0).toUpperCase() + entry.outcome.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {/* Intensity (if craving) */}
        {entry.had_craving && entry.intensity !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intensity</Text>
            <View style={styles.intensityContainer}>
              <Text style={styles.intensityNumber}>{entry.intensity}</Text>
              <Text style={styles.intensityScale}>/10</Text>
            </View>
          </View>
        )}

        {/* Triggers */}
        {entry.triggers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Triggers</Text>
            <View style={styles.tagsContainer}>
              {entry.triggers.map((trigger, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{trigger}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tools Used */}
        {entry.tools_used.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tools Used</Text>
            <View style={styles.tagsContainer}>
              {entry.tools_used.map((tool, index) => (
                <View key={index} style={styles.tagGreen}>
                  <Text style={styles.tagGreenText}>{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {entry.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        )}
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
  dateSection: {
    marginBottom: 32,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outcomeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  outcomeBadgeResisted: {
    backgroundColor: 'rgba(74,124,89,0.2)',
  },
  outcomeBadgePartial: {
    backgroundColor: 'rgba(184,160,123,0.2)',
  },
  outcomeBadgeUsed: {
    backgroundColor: 'rgba(196,120,92,0.2)',
  },
  outcomeBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  outcomeBadgeTextResisted: {
    color: '#7AB889',
  },
  outcomeBadgeTextPartial: {
    color: '#B8A07B',
  },
  outcomeBadgeTextUsed: {
    color: '#C4785C',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  intensityNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#C4785C',
  },
  intensityScale: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(196,120,92,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#C4785C',
  },
  tagGreen: {
    backgroundColor: 'rgba(74,124,89,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagGreenText: {
    fontSize: 14,
    color: '#7AB889',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
  },
});
