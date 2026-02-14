import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

const GroundingExercise = ({ tool, onComplete }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [answers, setAnswers] = useState({
    see: Array(5).fill(''),
    touch: Array(4).fill(''),
    hear: Array(3).fill(''),
    smell: Array(2).fill(''),
    taste: Array(1).fill('')
  });
  const [completedSections, setCompletedSections] = useState([]);

  const sections = [
    { id: 'see', label: '5 things you can see', count: 5, step: 0 },
    { id: 'touch', label: '4 things you can touch', count: 4, step: 1 },
    { id: 'hear', label: '3 things you can hear', count: 3, step: 2 },
    { id: 'smell', label: '2 things you can smell', count: 2, step: 3 },
    { id: 'taste', label: '1 thing you can taste', count: 1, step: 4 }
  ];

  const handleInputChange = (sectionId, index, value) => {
    setAnswers(prev => ({
      ...prev,
      [sectionId]: prev[sectionId].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSave = (sectionId) => {
    const sectionAnswers = answers[sectionId];
    const filledCount = sectionAnswers.filter(a => a.trim() !== '').length;
    
    if (filledCount === 0) {
      return;
    }

    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
    setActiveSection(null);
  };

  const handleCompleteExercise = () => {
    onComplete();
  };

  const allSectionsCompleted = completedSections.length === 5;

  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4 mt-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveSection(null)}
            className="w-8 h-8 flex items-center justify-center border border-white/[0.1] hover:border-white/[0.2] rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
          <h3 className="text-lg font-semibold text-white">
            Name {section.label}
          </h3>
        </div>

        <div className="space-y-3">
          {answers[activeSection].map((answer, index) => (
            <div key={index} className="space-y-1">
              <label className="text-xs text-white/40 uppercase tracking-wider">
                {index + 1}.
              </label>
              <Input
                data-testid={`grounding-${activeSection}-input-${index}`}
                value={answer}
                onChange={(e) => handleInputChange(activeSection, index, e.target.value)}
                placeholder={`Thing ${index + 1}`}
                className="h-12 bg-white/[0.03] border-white/[0.1] focus:border-white/[0.2] text-white placeholder:text-white/30 rounded-lg"
              />
            </div>
          ))}
        </div>

        <Button
          data-testid={`grounding-${activeSection}-save`}
          onClick={() => handleSave(activeSection)}
          className="w-full bg-white text-[#0F1115] hover:bg-white/90 h-12 rounded-xl font-semibold mt-6"
        >
          Save
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-white/50 mb-4">
        Ground yourself by identifying things with each of your senses
      </p>

      <div className="space-y-3">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            data-testid={`grounding-section-${section.id}`}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15] rounded-xl flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              {completedSections.includes(section.id) && (
                <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
              )}
              <span className="text-sm font-medium text-white">
                {section.label}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </motion.button>
        ))}
      </div>

      {allSectionsCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button
            data-testid="grounding-complete-button"
            onClick={handleCompleteExercise}
            className="w-full bg-[#4A7C59] hover:bg-[#5A8C69] text-white h-12 rounded-xl"
          >
            <CheckCircle2 className="mr-2 w-5 h-5" />
            Complete Exercise
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default GroundingExercise;
