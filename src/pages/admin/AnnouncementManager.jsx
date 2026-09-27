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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97B4A]/15 text-[#C97B4A] dark:text-[#E58A54] dark:border-[#E58A54]/40 dark:bg-[#E58A54]/15 text-xs font-bold border border-[#C97B4A]/30 mb-2">
            <span>SDG 3 Outreach</span>
          </div>
          <h1 className="text-2xl font-black text-[#22291F] dark:text-[#FAF7F2] tracking-tight mt-0.5 font-heading">
            Community Health Camps &amp; SDG Initiatives
          </h1>
          <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] mt-1">
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
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          {showAddForm && !editingCamp ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm && !editingCamp ? 'Close Form' : '+ New Health Camp'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 dark:border-[#52B788]/30 rounded-xl text-xs font-medium text-[#2D6A4F] dark:text-[#52B788] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Add / Edit Announcement Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#1C221C] rounded-3xl border border-[#E6DFC6] dark:border-[#2F3B2F] shadow-sm p-6 sm:p-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6DFC6] dark:border-[#2F3B2F]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${editingCamp ? 'bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] border border-[#C97B4A]/30' : 'bg-[#2D6A4F]/10 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/20 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788]'} flex items-center justify-center font-bold`}>
                {editingCamp ? <Edit3 className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
                    {editingCamp ? 'Edit Community Health Camp' : 'Publish Health Camp Announcement'}
                  </h2>
                  {editingCamp && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C97B4A]/15 text-[#B35F2B] dark:text-[#E58A54] border border-[#C97B4A]/30">
                      Editing Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
                  {editingCamp ? `Updating existing details for "${editingCamp.title}"` : 'Visible to patients, doctors, and the community'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2] hover:bg-[#FAF7F2] dark:hover:bg-[#242C24] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#C97B4A]/10 border border-[#C97B4A]/30 dark:border-[#E58A54]/40 dark:bg-[#E58A54]/15 rounded-xl text-xs font-medium text-[#C97B4A] dark:text-[#E58A54]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Camp Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Hypertension & Diabetes Screening Camp"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                >
                  <option value="health_camp" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Health Camp / Diagnostic</option>
                  <option value="vaccination" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Vaccination &amp; Immunization</option>
                  <option value="awareness" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Awareness &amp; Education</option>
                  <option value="maternal" className="bg-white dark:bg-[#242C24] text-[#22291F] dark:text-[#FAF7F2]">Maternal &amp; Child Health</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Date of Event *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Community Center Hall B, Sector 4"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                Description &amp; Health Objectives *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the medical services, target demographic, and free facilities provided..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Target Group
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="e.g. Senior Citizens (45+ yrs) or Mothers & Infants"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
                  Organizer / Lead Unit
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="e.g. Apna Community Outreach Team"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] dark:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl text-sm text-[#22291F] dark:text-[#FAF7F2] placeholder-[#8E8E84] dark:placeholder-[#94A493] focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#52B788] focus:ring-1 focus:ring-[#2D6A4F] dark:focus:ring-[#52B788] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6B63] dark:text-[#C4CFC3] uppercase tracking-wider mb-1.5">
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
                        ? 'bg-[#2D6A4F] dark:bg-[#357A5B] text-[#FAF7F2] border-[#2D6A4F] dark:border-[#52B788] shadow-xs'
                        : 'bg-[#FAF7F2] dark:bg-[#242C24] border-[#D8CEB3] dark:border-[#445644] text-[#6B6B63] dark:text-[#C4CFC3] hover:text-[#22291F] dark:hover:text-[#FAF7F2] hover:border-[#2D6A4F]/40 dark:hover:border-[#52B788]/50'
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
                className="px-4 py-2 text-xs font-semibold text-[#6B6B63] hover:text-[#22291F] hover:bg-[#FAF7F2] dark:text-[#C4CFC3] dark:hover:text-[#FAF7F2] dark:hover:bg-[#242C24] border border-[#D8CEB3] dark:border-[#445644] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
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
          <h2 className="text-lg font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">
            Active Health Camps ({announcements.length})
          </h2>
          <span className="text-xs text-[#6B6B63] dark:text-[#C4CFC3]">
            Click <Edit3 className="w-3.5 h-3.5 inline mx-0.5 text-[#2D6A4F] dark:text-[#52B788]" /> to modify camp details anytime
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-[#FAF7F2] dark:bg-[#1C221C] rounded-3xl border border-dashed border-[#D8CEB3] dark:border-[#2F3B2F] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#357A5B]/20 border border-[#2D6A4F]/20 dark:border-[#52B788]/30 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center mx-auto">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#22291F] dark:text-[#FAF7F2] font-heading">No Announcements Published Yet</h3>
              <p className="text-xs text-[#6B6B63] dark:text-[#C4CFC3] max-w-sm mx-auto mt-1">
                Share free clinical screening camps, vaccination drives, or health education seminars with your community.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCamp(null);
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#245740] dark:bg-[#357A5B] dark:hover:bg-[#2D6A4F] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
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
