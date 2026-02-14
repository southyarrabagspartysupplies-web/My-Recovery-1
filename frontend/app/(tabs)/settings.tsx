import React, { useState, useEffect } from 'react';
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
import { authAPI, userAPI } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/authStore';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    sponsor_name: '',
    sponsor_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    timer_minutes: 15,
    sobriety_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
        setFormData({
          display_name: response.data.display_name || '',
          sponsor_name: response.data.sponsor_name || '',
          sponsor_phone: response.data.sponsor_phone || '',
          emergency_contact_name: response.data.emergency_contact_name || response.data.sponsor_name || '',
          emergency_contact_phone: response.data.emergency_contact_phone || response.data.sponsor_phone || '',
          timer_minutes: response.data.timer_minutes || 15,
          sobriety_date: response.data.sobriety_date || '',
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to load settings');
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userAPI.updateSettings(formData);
      Alert.alert('Success', 'Settings saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userAPI.deleteAccount();
              await logout();
              router.replace('/auth');
              Alert.alert('Account Deleted', 'Your account has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  if (fetching) {
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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={formData.display_name}
              onChangeText={(text) => setFormData({ ...formData, display_name: text })}
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sponsor Name</Text>
            <TextInput
              style={styles.input}
              value={formData.sponsor_name}
              onChangeText={(text) => setFormData({ ...formData, sponsor_name: text })}
              placeholder="Your sponsor's name"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sponsor Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.sponsor_phone}
              onChangeText={(text) => setFormData({ ...formData, sponsor_phone: text })}
              placeholder="Your sponsor's phone"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_name}
              onChangeText={(text) => setFormData({ ...formData, emergency_contact_name: text })}
              placeholder="Emergency contact name"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.emergency_contact_phone}
              onChangeText={(text) => setFormData({ ...formData, emergency_contact_phone: text })}
              placeholder="Emergency contact phone"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="phone-pad"
            />
          </View>

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
            <Text style={styles.label}>Sobriety Date</Text>
            <TextInput
              style={styles.input}
              value={formData.sobriety_date}
              onChangeText={(text) => setFormData({ ...formData, sobriety_date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0F1115" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <View style={styles.privacyRow}>
            <Ionicons name="shield" size={20} color="rgba(255,255,255,0.4)" />
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Privacy</Text>
              <Text style={styles.privacyText}>
                All your data is private and stored securely. Only you have access to your journal entries,
                sessions, and personal information.
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#C4785C" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash" size={20} color="#E57373" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  section: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  inputDisabled: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: 'rgba(255,255,255,0.4)',
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
  saveButton: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.4)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#C4785C',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
    marginBottom: 40,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#E57373',
  },
});
