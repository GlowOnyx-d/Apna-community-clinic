import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Megaphone,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X
} from 'lucide-react';
import HealthCampCard from '../../components/common/HealthCampCard';

const COMMON_SDG_TAGS = [
  "SDG 3: Good Health & Well-being",
  "SDG 2: Zero Hunger",
  "SDG 5: Gender Equality",
  "SDG 6: Clean Water & Sanitation",
  "SDG 10: Reduced Inequalities"
];

export default function AnnouncementManager() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('health_camp');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [targetGroup, setTargetGroup] = useState('Open to All');
  const [organizer, setOrganizer] = useState('Apna Community Health Team');
  const [selectedTags, setSelectedTags] = useState(["SDG 3: Good Health & Well-being"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStartEdit = (camp) => {
    setEditingCamp(camp);
    setTitle(camp.title || '');
    setCategory(camp.category || 'health_camp');
    setDescription(camp.description || '');
    setDate(camp.date || '');
    setLocation(camp.location || '');
    setTargetGroup(camp.targetGroup || 'Open to All');
    setOrganizer(camp.organizer || 'Apna Community Health Team');
    setSelectedTags(camp.sdgTags && camp.sdgTags.length > 0 ? camp.sdgTags : ["SDG 3: Good Health & Well-being"]);
    setError('');
    setShowAddForm(true);

    // Smooth scroll to form
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingCamp(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setError('');
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !location) {
      setError('Please fill in title, description, date, and location');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        sdgTags: selectedTags.length > 0 ? selectedTags : ["SDG 3: Good Health & Well-being"],
        date,
        location: location.trim(),
        targetGroup: targetGroup.trim(),
        organizer: organizer.trim()
      };

      if (editingCamp) {
        await updateAnnouncement(editingCamp.id, payload);
        setSuccess(`Health camp "${title}" updated successfully!`);
      } else {
        await addAnnouncement(payload);
        setSuccess('Community health camp announcement published successfully!');
      }

      handleCancelForm();
      setTimeout(() => setSuccess(''), 4500);
    } catch (err) {
      setError(err.message || 'Failed to save health camp announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCamp = (camp) => {
    if (window.confirm(`Are you sure you want to delete the health camp "${camp.title}"?`)) {
      deleteAnnouncement(camp.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F97316]/15 text-[#F97316] dark:text-[#FB923C] dark:border-[#FB923C]/40 dark:bg-[#FB923C]/15 text-xs font-bold border border-[#F97316]/30 mb-2">
            <span>SDG 3 Outreach</span>
          </div>
          <h1 className="text-2xl font-black text-[#132226] dark:text-[#F4F7F6] tracking-tight mt-0.5 font-heading">
            Community Health Camps &amp; SDG Initiatives
          </h1>
          <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] mt-1">
            Publish, edit, and track free community screenings, immunization campaigns, and health drives under UN SDG 3.
          </p>
        </div>

        <button
          onClick={() => {
            if (showAddForm && !editingCamp) {
              handleCancelForm();
            } else {
              setEditingCamp(null);
              setTitle('');
              setDescription('');
              setDate('');
              setLocation('');
              setError('');
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          {showAddForm && !editingCamp ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm && !editingCamp ? 'Close Form' : '+ New Health Camp'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#0F766E]/15 border border-[#0F766E]/30 dark:border-[#2DD4BF]/30 rounded-xl text-xs font-medium text-[#0F766E] dark:text-[#2DD4BF] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-[#2DD4BF] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add / Edit Announcement Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#121C21] rounded-3xl border border-[#E0E7E5] dark:border-[#21333A] shadow-sm p-6 sm:p-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E0E7E5] dark:border-[#21333A]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${editingCamp ? 'bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/30' : 'bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF]'} flex items-center justify-center font-bold`}>
                {editingCamp ? <Edit3 className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
                    {editingCamp ? 'Edit Community Health Camp' : 'Publish Health Camp Announcement'}
                  </h2>
                  {editingCamp && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F97316]/15 text-[#EA580C] dark:text-[#FB923C] border border-[#F97316]/30">
                      Editing Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
                  {editingCamp ? `Updating existing details for "${editingCamp.title}"` : 'Visible to patients, doctors, and the community'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6] hover:bg-[#F4F7F6] dark:hover:bg-[#19272D] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#F97316]/10 border border-[#F97316]/30 dark:border-[#FB923C]/40 dark:bg-[#FB923C]/15 rounded-xl text-xs font-medium text-[#F97316] dark:text-[#FB923C]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                Camp Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Hypertension & Diabetes Screening Camp"
                className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                >
                  <option value="health_camp" className="bg-white dark:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6]">Health Camp / Diagnostic</option>
                  <option value="vaccination" className="bg-white dark:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6]">Vaccination &amp; Immunization</option>
                  <option value="awareness" className="bg-white dark:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6]">Awareness &amp; Education</option>
                  <option value="maternal" className="bg-white dark:bg-[#19272D] text-[#132226] dark:text-[#F4F7F6]">Maternal &amp; Child Health</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Date of Event *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Community Center Hall B, Sector 4"
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                Description &amp; Health Objectives *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the medical services, target demographic, and free facilities provided..."
                className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Target Group
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="e.g. Senior Citizens (45+ yrs) or Mothers & Infants"
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                  Organizer / Lead Unit
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="e.g. Apna Community Outreach Team"
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F6] dark:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl text-sm text-[#132226] dark:text-[#F4F7F6] placeholder-[#758D94] dark:placeholder-[#79949B] focus:outline-none focus:border-[#0F766E] dark:focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#0F766E] dark:focus:ring-[#2DD4BF] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A7178] dark:text-[#9DB4BA] uppercase tracking-wider mb-1.5">
                UN SDG Alignment Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SDG_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${isSelected
                        ? 'bg-[#0F766E] dark:bg-[#0D9488] text-[#F4F7F6] border-[#0F766E] dark:border-[#2DD4BF] shadow-xs'
                        : 'bg-[#F4F7F6] dark:bg-[#19272D] border-[#CFDAD6] dark:border-[#2C444E] text-[#5A7178] dark:text-[#9DB4BA] hover:text-[#132226] dark:hover:text-[#F4F7F6] hover:border-[#0F766E]/40 dark:hover:border-[#2DD4BF]/50'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 text-xs font-semibold text-[#5A7178] hover:text-[#132226] hover:bg-[#F4F7F6] dark:text-[#9DB4BA] dark:hover:text-[#F4F7F6] dark:hover:bg-[#19272D] border border-[#CFDAD6] dark:border-[#2C444E] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading 
                  ? (editingCamp ? 'Updating Camp...' : 'Publishing...') 
                  : (editingCamp ? 'Save Changes' : 'Publish Camp Announcement')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">
            Active Health Camps ({announcements.length})
          </h2>
          <span className="text-xs text-[#5A7178] dark:text-[#9DB4BA]">
            Click <Edit3 className="w-3.5 h-3.5 inline mx-0.5 text-[#0F766E] dark:text-[#2DD4BF]" /> to modify camp details anytime
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-[#F4F7F6] dark:bg-[#121C21] rounded-3xl border border-dashed border-[#CFDAD6] dark:border-[#21333A] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 dark:bg-[#0D9488]/20 border border-[#0F766E]/20 dark:border-[#2DD4BF]/30 text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#132226] dark:text-[#F4F7F6] font-heading">No Announcements Published Yet</h3>
              <p className="text-xs text-[#5A7178] dark:text-[#9DB4BA] max-w-sm mx-auto mt-1">
                Share free clinical screening camps, vaccination drives, or health education seminars with your community.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCamp(null);
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#0D9488] dark:hover:bg-[#0F766E] text-[#F4F7F6] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish First Health Camp</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <HealthCampCard
                key={ann.id}
                ann={ann}
                role="admin"
                onEdit={handleStartEdit}
                onDelete={handleDeleteCamp}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
