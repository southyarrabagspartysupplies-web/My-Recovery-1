import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

interface JournalInsights {
  top_triggers: { trigger: string; count: number }[];
  most_helpful_tools: { tool: string; count: number }[];
  total_entries: number;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<JournalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, insightsRes] = await Promise.all([
        journalAPI.getEntries(),
        journalAPI.getInsights(),
      ]);
      setEntries(entriesRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load journal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E57373" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/journal-add')}
          >
            <Ionicons name="add" size={24} color="#0F1115" />
          </TouchableOpacity>
        </View>

        {/* Insights */}
        {insights && insights.total_entries > 0 && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.6)" />
              <Text style={styles.insightsTitle}>Insights</Text>
            </View>

            {insights.top_triggers.length > 0 && (
              <View style={styles.insightSection}>
                <Text style={styles.insightSectionTitle}>TOP TRIGGERS</Text>
                <View style={styles.tagsRow}>
                  {insights.top_triggers.slice(0, 3).map((item) => (
                    <View key={item.trigger} style={styles.tagItem}>
                      <Text style={styles.tagText}>{item.trigger} ({item.count})</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {insights.most_helpful_tools.length > 0 && (
              <View style={styles.insightSection}>
                <Text style={styles.insightSectionTitle}>MOST HELPFUL TOOLS</Text>
                <View style={styles.tagsRow}>
                  {insights.most_helpful_tools.slice(0, 3).map((item) => (
                    <View key={item.tool} style={styles.tagItemGreen}>
                      <Text style={styles.tagTextGreen}>{item.tool} ({item.count})</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Entries List */}
        <View style={styles.entriesList}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No entries yet</Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => router.push('/journal-add')}
              >
                <Ionicons name="add" size={20} color="#0F1115" />
                <Text style={styles.addFirstButtonText}>Add Your First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry, index) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => router.push(`/journal-detail?id=${entry.id}`)}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>
                    {format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}
                  </Text>
                  {entry.outcome && (
                    <View style={[
                      styles.outcomeBadge,
                      entry.outcome === 'resisted' && styles.outcomeBadgeResisted,
                      entry.outcome === 'partial' && styles.outcomeBadgePartial,
                    ]}>
                      <Text style={[
                        styles.outcomeBadgeText,
                        entry.outcome === 'resisted' && styles.outcomeBadgeTextResisted,
                        entry.outcome === 'partial' && styles.outcomeBadgeTextPartial,
                      ]}>
                        {entry.outcome}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.entryTitle}>
                  {entry.had_craving ? 'Had a craving' : 'Daily check-in'}
                </Text>
                {entry.notes && (
                  <Text style={styles.entryNotes} numberOfLines={2}>
                    {entry.notes}
                  </Text>
                )}
              </TouchableOpacity>
            ))
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightSection: {
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  tagItemGreen: {
    backgroundColor: 'rgba(74,124,89,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,124,89,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagTextGreen: {
    fontSize: 13,
    color: '#7AB889',
  },
  entriesList: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
  entryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  outcomeBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outcomeBadgeResisted: {
    backgroundColor: 'rgba(74,124,89,0.2)',
  },
  outcomeBadgePartial: {
    backgroundColor: 'rgba(139,105,20,0.2)',
  },
  outcomeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  outcomeBadgeTextResisted: {
    color: '#7AB889',
  },
  outcomeBadgeTextPartial: {
    color: '#C4A24D',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 20,
  },
});
