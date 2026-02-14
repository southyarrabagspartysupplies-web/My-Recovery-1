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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resourcesAPI } from '../src/lib/api';

interface Resource {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  created_at: string;
}

const DEFAULT_RESOURCES = [
  { title: 'SAMHSA National Helpline', url: 'https://www.samhsa.gov/find-help/national-helpline', description: '24/7 free, confidential support' },
  { title: 'NA Meeting Finder', url: 'https://www.na.org/meetingsearch/', description: 'Find local meetings' },
  { title: 'AA Meeting Finder', url: 'https://www.aa.org/find-aa', description: 'Find local AA meetings' },
  { title: 'Crisis Text Line', url: 'https://www.crisistextline.org/', description: 'Text HOME to 741741' },
];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '', notes: '' });
  const router = useRouter();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourcesAPI.getResources();
      setResources(response.data);
    } catch (error) {
      console.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      await resourcesAPI.createResource(newResource);
      setShowAddModal(false);
      setNewResource({ title: '', url: '', notes: '' });
      fetchResources();
      Alert.alert('Success', 'Resource added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (id: string) => {
    Alert.alert(
      'Delete Resource',
      'Are you sure you want to delete this resource?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await resourcesAPI.deleteResource(id);
              fetchResources();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete resource');
            }
          },
        },
      ]
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open link');
    });
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
          <Text style={styles.headerTitle}>Resources</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#0F1115" />
          </TouchableOpacity>
        </View>

        {/* Default Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT HOTLINES & TOOLS</Text>
          {DEFAULT_RESOURCES.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceCard}
              onPress={() => openUrl(resource.url)}
            >
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* User Resources */}
        {resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY RESOURCES</Text>
            {resources.map((resource) => (
              <View key={resource.id} style={styles.resourceCard}>
                <TouchableOpacity
                  style={styles.resourceContent}
                  onPress={() => resource.url && openUrl(resource.url)}
                >
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  {resource.notes && (
                    <Text style={styles.resourceDescription}>{resource.notes}</Text>
                  )}
                  {resource.url && (
                    <Text style={styles.resourceUrl} numberOfLines={1}>{resource.url}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteResource(resource.id)}
                >
                  <Ionicons name="trash" size={18} color="#E57373" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Resource Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Resource</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Resource name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newResource.title}
                onChangeText={(text) => setNewResource({ ...newResource, title: text })}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>URL (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newResource.url}
                onChangeText={(text) => setNewResource({ ...newResource, url: text })}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                placeholder="Add notes..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newResource.notes}
                onChangeText={(text) => setNewResource({ ...newResource, notes: text })}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddResource}
            >
              <Text style={styles.modalSaveButtonText}>Add Resource</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 16,
  },
  resourceCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  resourceUrl: {
    fontSize: 12,
    color: '#5B8DB8',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1D22',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modalSaveButton: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
});
