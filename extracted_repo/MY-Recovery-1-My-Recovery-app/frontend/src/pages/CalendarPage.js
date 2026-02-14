import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Bell,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, addWeeks, subWeeks, isSameMonth, isSameDay, parseISO } from 'date-fns';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('monthly'); // monthly, weekly, daily
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 60,
    reminder: 30,
    reminder_enabled: true
  });
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/calendar/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Check for upcoming notifications
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      events.forEach(event => {
        if (!event.reminder_enabled || event.notified) return;
        
        const eventTime = new Date(`${event.date}T${event.time}`);
        const reminderTime = new Date(eventTime.getTime() - event.reminder * 60000);
        
        if (now >= reminderTime && now < eventTime) {
          // Show in-app notification
          toast.info(`Upcoming: ${event.title}`, {
            description: `In ${event.reminder} minutes`,
            duration: 10000
          });
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Anchor - Upcoming Event', {
              body: `${event.title} in ${event.reminder} minutes`,
              icon: '/favicon.ico'
            });
          }
          
          // Mark as notified (in memory only for this session)
          event.notified = true;
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    checkNotifications(); // Check immediately
    
    return () => clearInterval(interval);
  }, [events]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await api.post('/calendar/events', formData);
      toast.success('Event added');
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        duration: 60,
        reminder: 30,
        reminder_enabled: true
      });
      fetchEvents();
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/calendar/events/${eventId}`);
      toast.success('Event deleted');
      setIsViewModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const openAddModal = (date = selectedDate) => {
    setFormData(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    setIsAddModalOpen(true);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  // Navigation
  const navigatePrev = () => {
    if (view === 'monthly') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'weekly') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (view === 'monthly') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'weekly') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };

  // Render monthly view
  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Header row with day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayEvents = getEventsForDate(currentDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        days.push(
          <button
            key={day.toString()}
            onClick={() => {
              setSelectedDate(currentDay);
              if (dayEvents.length > 0) {
                setView('daily');
                setCurrentDate(currentDay);
              }
            }}
            onDoubleClick={() => openAddModal(currentDay)}
            className={`
              aspect-square p-1 rounded-lg text-center relative transition-all
              ${isCurrentMonth ? 'text-white' : 'text-white/30'}
              ${isToday ? 'bg-white/10 font-bold' : ''}
              ${isSelected ? 'ring-2 ring-white/30' : ''}
              hover:bg-white/5
            `}
          >
            <span className="text-sm">{format(day, 'd')}</span>
            {dayEvents.length > 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {dayEvents.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-1 h-1 rounded-full bg-[#E57373]" />
                ))}
              </div>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs text-white/40 font-medium py-2">
              {name}
            </div>
          ))}
        </div>
        {rows}
      </div>
    );
  };

  // Render weekly view
  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayEvents = getEventsForDate(day);
      const isToday = isSameDay(day, new Date());

      days.push(
        <div
          key={day.toString()}
          className={`p-3 rounded-xl border ${isToday ? 'bg-white/5 border-white/20' : 'border-white/[0.08]'}`}
        >
          <div className="text-center mb-3">
            <p className="text-xs text-white/40 uppercase">{format(day, 'EEE')}</p>
            <p className={`text-lg font-bold ${isToday ? 'text-white' : 'text-white/70'}`}>
              {format(day, 'd')}
            </p>
          </div>
          <div className="space-y-2 min-h-[100px]">
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => openEventModal(event)}
                className="w-full text-left p-2 bg-[#3D1F1F]/50 border border-[#8B3A3A]/30 rounded-lg text-xs"
              >
                <p className="font-medium text-white truncate">{event.title}</p>
                <p className="text-white/50">{event.time}</p>
              </button>
            ))}
            <button
              onClick={() => openAddModal(day)}
              className="w-full p-2 border border-dashed border-white/10 rounded-lg text-xs text-white/30 hover:border-white/20 hover:text-white/50 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    );
  };

  // Render daily view
  const renderDailyView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-1">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-white">{format(currentDate, 'EEEE')}</p>
          <p className="text-white/50">{format(currentDate, 'MMMM d, yyyy')}</p>
        </div>
        
        {dayEvents.length > 0 ? (
          <div className="space-y-3 mb-6">
            <p className="text-xs text-white/40 uppercase tracking-wider">Events</p>
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => openEventModal(event)}
                className="w-full text-left p-4 bg-[#3D1F1F]/50 border border-[#8B3A3A]/30 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-sm text-white/50 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {event.time} • {event.duration} min
                    </p>
                    {event.description && (
                      <p className="text-sm text-white/40 mt-2">{event.description}</p>
                    )}
                  </div>
                  {event.reminder_enabled && (
                    <Bell className="w-4 h-4 text-[#E57373]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/40">No events scheduled</p>
          </div>
        )}

        <Button
          onClick={() => openAddModal(currentDate)}
          className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Event
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Header with Back/Forward Navigation */}
        <div className="flex items-center justify-between mb-6">
          <TopNav showHome={true} />
          <Button
            data-testid="calendar-add-button"
            onClick={() => openAddModal()}
            size="icon"
            className="w-10 h-10 bg-white text-[#0F1115] hover:bg-white/90 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
          Calendar
        </h1>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {['monthly', 'weekly', 'daily'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                view === v 
                  ? 'bg-white text-[#0F1115]' 
                  : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={navigatePrev}
            className="w-10 h-10 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {view === 'monthly' && format(currentDate, 'MMMM yyyy')}
              {view === 'weekly' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
              {view === 'daily' && format(currentDate, 'MMM d, yyyy')}
            </p>
            <button
              onClick={goToToday}
              className="text-xs text-[#E57373] hover:text-[#EF9A9A]"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={navigateNext}
            className="w-10 h-10 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Calendar View */}
        <motion.div
          key={`${view}-${currentDate.toISOString()}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
        >
          {view === 'monthly' && renderMonthlyView()}
          {view === 'weekly' && renderWeeklyView()}
          {view === 'daily' && renderDailyView()}
        </motion.div>

        {/* Selected Date Events (Monthly view) */}
        {view === 'monthly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
              <button
                onClick={() => openAddModal(selectedDate)}
                className="text-xs text-[#E57373] hover:text-[#EF9A9A]"
              >
                + Add Event
              </button>
            </div>
            
            <div className="space-y-2">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-white/40 py-4 text-center">No events</p>
              ) : (
                getEventsForDate(selectedDate).map(event => (
                  <button
                    key={event.id}
                    onClick={() => openEventModal(event)}
                    className="w-full text-left p-3 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{event.title}</p>
                        <p className="text-xs text-white/50">{event.time} • {event.duration} min</p>
                      </div>
                      {event.reminder_enabled && <Bell className="w-4 h-4 text-white/30" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-sm bg-[#1A1D22] border-white/[0.1]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-white/60">Title</Label>
              <Input
                data-testid="event-title-input"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white/60">Description (optional)</Label>
              <Textarea
                data-testid="event-description-input"
                placeholder="Add details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/60">Date</Label>
                <Input
                  data-testid="event-date-input"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.1] text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Time</Label>
                <Input
                  data-testid="event-time-input"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.1] text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/60">Duration</Label>
                <Select
                  value={String(formData.duration)}
                  onValueChange={(val) => setFormData({ ...formData, duration: parseInt(val) })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D22] border-white/[0.1]">
                    <SelectItem value="15" className="text-white">15 min</SelectItem>
                    <SelectItem value="30" className="text-white">30 min</SelectItem>
                    <SelectItem value="60" className="text-white">1 hour</SelectItem>
                    <SelectItem value="90" className="text-white">1.5 hours</SelectItem>
                    <SelectItem value="120" className="text-white">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Reminder</Label>
                <Select
                  value={String(formData.reminder)}
                  onValueChange={(val) => setFormData({ ...formData, reminder: parseInt(val) })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.1] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D22] border-white/[0.1]">
                    <SelectItem value="5" className="text-white">5 min before</SelectItem>
                    <SelectItem value="15" className="text-white">15 min before</SelectItem>
                    <SelectItem value="30" className="text-white">30 min before</SelectItem>
                    <SelectItem value="60" className="text-white">1 hour before</SelectItem>
                    <SelectItem value="1440" className="text-white">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <input
                type="checkbox"
                id="reminder-enabled"
                checked={formData.reminder_enabled}
                onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-white/30"
              />
              <Label htmlFor="reminder-enabled" className="text-sm text-white/70 cursor-pointer">
                Enable notifications for this event
              </Label>
            </div>

            <Button
              data-testid="event-save-button"
              type="submit"
              className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold"
            >
              Save Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-sm bg-[#1A1D22] border-white/[0.1]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white">{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 text-white/70">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Clock className="w-5 h-5" />
                  <span>{selectedEvent.time} • {selectedEvent.duration} minutes</span>
                </div>
                {selectedEvent.reminder_enabled && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Bell className="w-5 h-5" />
                    <span>Reminder {selectedEvent.reminder} min before</span>
                  </div>
                )}
                {selectedEvent.description && (
                  <p className="text-white/50 p-3 bg-white/[0.02] rounded-lg">
                    {selectedEvent.description}
                  </p>
                )}
                <Button
                  data-testid="event-delete-button"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-[#8B3A3A] text-[#E57373] hover:bg-[#3D1F1F]/50"
                >
                  <Trash2 className="mr-2 w-5 h-5" />
                  Delete Event
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default CalendarPage;
