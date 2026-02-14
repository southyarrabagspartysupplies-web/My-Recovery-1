import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NavigationBar } from '@/components/NavigationBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { journalAPI } from '@/lib/api';
import { toast } from 'sonner';

const TRIGGERS = [
  'Boredom', 'Loneliness', 'Stress', 'Anger', 'Anxiety', 'Sadness',
  'Celebration', 'Social Pressure', 'Seeing Content/People'
];

const JournalAdd = () => {
  const [hadCraving, setHadCraving] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [intensity, setIntensity] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleTrigger = (trigger) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await journalAPI.createEntry({
        had_craving: hadCraving,
        triggers: selectedTriggers,
        intensity: intensity ? parseInt(intensity) : null,
        tools_used: toolsUsed ? toolsUsed.split(',').map(t => t.trim()) : [],
        outcome: outcome || null,
        notes: notes,
      });
      toast.success('Journal entry saved');
      navigate('/journal');
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NavigationBar />
          <h1 className="text-2xl font-bold tracking-tight text-white flex-1">
            New Entry
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <Checkbox
                data-testid="journal-had-craving-checkbox"
                id="had-craving"
                checked={hadCraving}
                onCheckedChange={setHadCraving}
                className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#0F1115]"
              />
              <Label htmlFor="had-craving" className="text-base cursor-pointer text-white">
                I had a craving today
              </Label>
            </div>

            {hadCraving && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white/60">Triggers</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {TRIGGERS.map((trigger) => (
                      <div key={trigger} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedTriggers.includes(trigger)
                          ? 'bg-white/[0.05] border-white/[0.2]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
                      }`}
                      onClick={() => toggleTrigger(trigger)}>
                        <Checkbox
                          data-testid={`journal-trigger-${trigger.toLowerCase()}`}
                          id={`trigger-${trigger}`}
                          checked={selectedTriggers.includes(trigger)}
                          onCheckedChange={() => toggleTrigger(trigger)}
                          className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#0F1115]"
                        />
                        <Label htmlFor={`trigger-${trigger}`} className="cursor-pointer text-sm text-white/80">
                          {trigger}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">Intensity (1-10)</Label>
                  <Input
                    data-testid="journal-intensity-input"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="5"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value)}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">Tools Used (comma-separated)</Label>
                  <Input
                    data-testid="journal-tools-input"
                    placeholder="Breathing, Grounding, Walk"
                    value={toolsUsed}
                    onChange={(e) => setToolsUsed(e.target.value)}
                    className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white/60">Outcome</Label>
                  <Select value={outcome} onValueChange={setOutcome}>
                    <SelectTrigger data-testid="journal-outcome-select" className="h-12 bg-white/[0.03] border-white/[0.1] text-white rounded-lg">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1D22] border-white/[0.1]">
                      <SelectItem value="resisted" className="text-white hover:bg-white/[0.05]">Resisted</SelectItem>
                      <SelectItem value="partial" className="text-white hover:bg-white/[0.05]">Partially Resisted</SelectItem>
                      <SelectItem value="used" className="text-white hover:bg-white/[0.05]">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/60">Notes</Label>
              <Textarea
                data-testid="journal-notes-textarea"
                placeholder="How are you feeling? What's on your mind?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg resize-none"
              />
            </div>

            <Button
              data-testid="journal-save-button"
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default JournalAdd;
