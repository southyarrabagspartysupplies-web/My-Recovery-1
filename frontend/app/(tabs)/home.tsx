import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { authAPI } from '../../src/lib/api';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
        logout();
        router.replace('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEmergencyCall = () => {
    if (user?.sponsor_phone) {
      Linking.openURL(`tel:${user.sponsor_phone}`);
    } else {
      Alert.alert('No Contact', 'No emergency contact set. Add one in Settings.');
      router.push('/(tabs)/settings');
    }
  };

  const menuItems = [
    { icon: 'book', label: 'Journal', path: '/journal' as const },
    { icon: 'calendar', label: 'Calendar', path: '/calendar' as const },
    { icon: 'trending-up', label: 'Progress', path: '/(tabs)/progress' as const },
    { icon: 'construct', label: 'Coping Tools', path: '/(tabs)/coping-tools' as const },
    { icon: 'library', label: 'Resources', path: '/resources' as const },
    { icon: 'call', label: 'Call Emergency', action: handleEmergencyCall, highlight: true },
  ];

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
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.headerLogoWrapper}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="menu" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.userName}>{user?.display_name}</Text>
          <Text style={styles.motto}>One day at a time</Text>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.cravingButton}
          onPress={() => router.push('/craving-flow')}
        >
          <View style={styles.cravingIconBox}>
            <Ionicons name="warning" size={24} color="#E57373" />
          </View>
          <View style={styles.cravingTextBox}>
            <Text style={styles.cravingTitle}>I'M HAVING A CRAVING</Text>
            <Text style={styles.cravingSubtitle}>Start a guided reset</Text>
          </View>
        </TouchableOpacity>

        {/* Navigation Tiles */}
        <View style={styles.tilesGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tile,
                item.highlight && styles.tileHighlight,
              ]}
              onPress={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  router.push(item.path);
                }
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.highlight ? '#7AB889' : 'rgba(255,255,255,0.6)'}
                style={styles.tileIcon}
              />
              <Text style={[styles.tileLabel, item.highlight && styles.tileLabelHighlight]}>
                {item.label}
              </Text>
            </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 180,
    height: 48,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  motto: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  cravingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D1F1F',
    borderWidth: 1,
    borderColor: '#8B3A3A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  cravingIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#4A2525',
    borderWidth: 1,
    borderColor: '#8B3A3A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cravingTextBox: {
    flex: 1,
  },
  cravingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cravingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  tile: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
  },
  tileHighlight: {
    backgroundColor: 'rgba(74,124,89,0.2)',
    borderColor: 'rgba(74,124,89,0.3)',
  },
  tileIcon: {
    marginBottom: 12,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  tileLabelHighlight: {
    color: '#7AB889',
  },
});
