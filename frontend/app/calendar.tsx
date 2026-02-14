import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { calendarAPI } from '../src/lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  reminder: number;
  reminder_enabled: boolean;
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '09:00',
    duration: 60,
  });
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await calendarAPI.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    try {
      await calendarAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: newEvent.time,
        duration: newEvent.duration,
        reminder: 30,
        reminder_enabled: true,
      });
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', time: '09:00', duration: 60 });
      fetchEvents();
      Alert.alert('Success', 'Event added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await calendarAPI.deleteEvent(eventId);
              fetchEvents();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

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
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#0F1115" />
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Day Labels */}
        <View style={styles.dayLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Add empty cells for offset */}
          {Array(startOfMonth(currentMonth).getDay()).fill(null).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          
          {getDaysInMonth().map((date) => {
            const dateEvents = getEventsForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}>
                  {format(date, 'd')}
                </Text>
                {dateEvents.length > 0 && (
                  <View style={styles.eventDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          
          {selectedDateEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No events for this day</Text>
          ) : (
            selectedDateEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventCardContent}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.eventDeleteButton}
                  onPress={() => handleDeleteEvent(event.id)}
                >
                  <Ionicons name="trash" size={18} color="#E57373" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDateText}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Event Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter event title"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Time (HH:MM)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="09:00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                placeholder="Add notes..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddEvent}
            >
              <Text style={styles.modalSaveButtonText}>Add Event</Text>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayLabels: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#5B8DB8',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#5B8DB8',
    marginTop: 4,
  },
  eventsSection: {
    paddingBottom: 40,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  noEventsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingVertical: 40,
  },
  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventCardContent: {
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B8DB8',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  eventDeleteButton: {
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalDateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
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
