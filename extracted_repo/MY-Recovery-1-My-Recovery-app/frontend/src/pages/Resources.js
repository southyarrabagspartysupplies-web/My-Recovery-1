import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { resourcesAPI } from '@/lib/api';
import { toast } from 'sonner';

const DEFAULT_RESOURCES = [
  { 
    title: 'Narcotics Anonymous', 
    url: 'https://www.na.org', 
    desc: 'Official NA World Services website'
  },
  { 
    title: 'NA Meeting Search', 
    url: 'https://www.na.org/meetingsearch/', 
    desc: 'Find NA meetings near you'
  },
  { 
    title: 'NA Literature & Resources', 
    url: 'https://www.na.org/literature', 
    desc: 'Access recovery literature and materials'
  },
  { 
    title: 'Just for Today - Daily Meditations', 
    url: 'https://www.jftna.org', 
    desc: 'Daily meditation and inspiration'
  },
];

const Resources = () => {
  const [customResources, setCustomResources] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourcesAPI.getResources();
      setCustomResources(response.data);
    } catch (error) {
      toast.error('Failed to load resources');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      await resourcesAPI.createResource(formData);
      toast.success('Resource added');
      setFormData({ title: '', url: '', notes: '' });
      setIsAddOpen(false);
      fetchResources();
    } catch (error) {
      toast.error('Failed to add resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await resourcesAPI.deleteResource(id);
      toast.success('Resource deleted');
      fetchResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 relative z-10">
      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Header with Back/Forward Navigation */}
        <TopNav title="Resources" />

        {/* Emergency Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2A1E1B] border border-[#6B4A3B] rounded-xl p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-[#C4785C] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#C4785C] mb-1">
                Emergency Notice
              </p>
              <p className="text-sm leading-relaxed text-white/70">
                If you are in immediate danger or experiencing a medical emergency, contact local emergency services (911 in the US) immediately.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Default Resources */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Official NA Resources
          </h2>
          <p className="text-xs text-white/30 mb-4 italic">
            External websites • Opens in new tab
          </p>
          <div className="space-y-3">
            {DEFAULT_RESOURCES.map((resource, index) => (
              <motion.a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`default-resource-${index}`}
                className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-medium text-white">{resource.title}</p>
                    <span className="px-2 py-0.5 bg-white/[0.05] text-white/50 text-xs rounded">
                      External
                    </span>
                  </div>
                  <p className="text-sm text-white/40">{resource.desc}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-white/30 flex-shrink-0 ml-3 group-hover:text-white/60 transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Custom Resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                My Personal Resources
              </h2>
              <p className="text-xs text-white/30 mt-1">
                Add contacts, links, or notes for quick access
              </p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  data-testid="add-resource-button"
                  size="sm"
                  className="rounded-lg h-8 px-3 bg-white text-[#0F1115] hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm bg-[#1A1D22] border-white/[0.1]">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Resource</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white/60">Title</Label>
                    <Input
                      data-testid="resource-title-input"
                      id="title"
                      placeholder="e.g., My therapist"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-white/60">URL (optional)</Label>
                    <Input
                      data-testid="resource-url-input"
                      id="url"
                      type="url"
                      placeholder="https://..."
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-white/60">Notes (optional)</Label>
                    <Textarea
                      data-testid="resource-notes-input"
                      id="notes"
                      placeholder="Phone number, contact info, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30"
                      rows={3}
                    />
                  </div>
                  <Button
                    data-testid="resource-save-button"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-[#0F1115] hover:bg-white/90"
                  >
                    {loading ? 'Saving...' : 'Save Resource'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {customResources.length === 0 ? (
              <p className="text-center text-white/30 py-8">No custom resources yet</p>
            ) : (
              customResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  data-testid={`custom-resource-${index}`}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-medium text-white">{resource.title}</p>
                        {resource.url && (
                          <span className="px-2 py-0.5 bg-[#4A7C59]/20 text-[#7AB889] text-xs rounded">
                            Link
                          </span>
                        )}
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#C4785C] hover:text-[#D88A6C] flex items-center gap-1 mb-2"
                        >
                          Open link 
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {resource.notes && (
                        <p className="text-sm text-white/50 whitespace-pre-wrap mt-2 p-3 bg-white/[0.02] rounded-lg">
                          {resource.notes}
                        </p>
                      )}
                    </div>
                    <button
                      data-testid={`delete-resource-${index}`}
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-white/30 hover:text-[#C4785C]" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Resources;
