import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { progressAPI } from '../../src/lib/api';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressStats {
  days_since_last_used: number | null;
  current_streak: number;
  cravings_this_week: number;
  avg_intensity_this_week: number | null;
  most_used_tools: { tool: string; count: number }[];
  most_common_triggers: { trigger: string; count: number }[];
}

interface ChartDataPoint {
  date: string;
  count: number;
}

export default function Progress() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          progressAPI.getProgress(),
          progressAPI.getChartData()
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data.data);
      } catch (error) {
        console.error('Progress fetch error:', error);
        setStats({
          days_since_last_used: null,
          current_streak: 0,
          cravings_this_week: 0,
          avg_intensity_this_week: null,
          most_used_tools: [],
          most_common_triggers: []
        });
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

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
          <Text style={styles.headerTitle}>Progress</Text>
        </View>

        {/* Streak Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={28} color="#C4785C" style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats?.current_streak || 0}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </View>

          {stats?.days_since_last_used !== null && stats?.days_since_last_used !== undefined && (
            <View style={styles.statCard}>
              <Ionicons name="flag" size={28} color="#4A7C59" style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.days_since_last_used}</Text>
              <Text style={styles.statLabel}>DAYS CLEAN</Text>
            </View>
          )}
        </View>

        {/* 14-Day Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.chartTitle}>Last 14 Days</Text>
          </View>
          <Text style={styles.chartSubtitle}>CRAVINGS LOGGED PER DAY</Text>
          
          <View style={styles.chartContainer}>
            {chartData.map((item, index) => {
              const barHeight = item.count > 0 ? (item.count / maxCount) * 100 : 4;
              const dateObj = new Date(item.date);
              const dayLabel = dateObj.getDate();
              
              return (
                <View key={index} style={styles.chartBarContainer}>
                  <View style={styles.chartBarWrapper}>
                    <View 
                      style={[
                        styles.chartBar,
                        { height: `${barHeight}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.chartBarLabel}>{dayLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Ionicons name="trending-up" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.insightsTitle}>Insights</Text>
          </View>

          {/* Top Triggers */}
          {stats?.most_common_triggers && stats.most_common_triggers.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>TOP 3 TRIGGERS THIS WEEK</Text>
              {stats.most_common_triggers.slice(0, 3).map((item, index) => (
                <View key={item.trigger} style={styles.insightRow}>
                  <View style={styles.insightRowLeft}>
                    <View style={styles.insightRank}>
                      <Text style={styles.insightRankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.insightRowText}>{item.trigger}</Text>
                  </View>
                  <Text style={styles.insightRowCount}>{item.count}x</Text>
                </View>
              ))}
            </View>
          )}

          {/* Most Helpful Tool */}
          {stats?.most_used_tools && stats.most_used_tools.length > 0 && (
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>MOST HELPFUL TOOL</Text>
              <View style={styles.helpfulToolCard}>
                <View style={styles.helpfulToolRow}>
                  <Text style={styles.helpfulToolName}>{stats.most_used_tools[0].tool}</Text>
                  <Text style={styles.helpfulToolCount}>{stats.most_used_tools[0].count}x used</Text>
                </View>
                <Text style={styles.helpfulToolNote}>
                  This tool helped you resist cravings most often
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Weekly Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="calendar" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.summaryTitle}>This Week</Text>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>CRAVINGS LOGGED</Text>
              <Text style={styles.summaryItemValue}>{stats?.cravings_this_week || 0}</Text>
            </View>

            {stats?.avg_intensity_this_week !== null && stats?.avg_intensity_this_week !== undefined && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>AVG INTENSITY</Text>
                <Text style={[styles.summaryItemValue, styles.summaryIntensity]}>
                  {stats.avg_intensity_this_week.toFixed(1)}/10
                </Text>
              </View>
            )}
          </View>
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
    marginTop: 8,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
  },
  statIcon: {
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarWrapper: {
    width: 12,
    height: 100,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#5B8DB8',
    borderRadius: 3,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
  insightsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightSection: {
    marginBottom: 24,
  },
  insightSectionTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  insightRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightRank: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
  },
  insightRowText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  insightRowCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C4785C',
  },
  helpfulToolCard: {
    backgroundColor: 'rgba(74,124,89,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,124,89,0.2)',
    borderRadius: 8,
    padding: 16,
  },
  helpfulToolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  helpfulToolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpfulToolCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7AB889',
  },
  helpfulToolNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryItemValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryIntensity: {
    color: '#C4785C',
  },
});
