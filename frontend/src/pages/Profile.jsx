import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiGlobe, FiEye, FiLoader } from 'react-icons/fi';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await profileService.getProfile();
        reset({
          preferredUnitSystem: profile.preferredUnitSystem,
          goalVisibility: profile.goalVisibility,
        });
      } catch (err) {
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const updated = await profileService.updateProfile(data);
      toast.success('Sustainability preferences updated successfully!');
      // Update local storage representation
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.preferredUnitSystem = updated.preferredUnitSystem;
      user.goalVisibility = updated.goalVisibility;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      toast.error('Failed to update preferences');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-64 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl animate-pulse"></div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 fade-in">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6 text-white">
          <FiUser className="text-2xl text-[var(--color-accent)]" />
          <h3 className="text-xl font-bold font-outfit">User Preferences</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label flex items-center gap-1.5">
              <FiGlobe />
              Preferred Unit System
            </label>
            <select 
              className="input-field"
              {...register('preferredUnitSystem')}
            >
              <option value="METRIC" className="bg-[var(--color-bg-secondary)]">Metric (km, kg, servings)</option>
              <option value="IMPERIAL" className="bg-[var(--color-bg-secondary)]">Imperial (miles, lbs, servings)</option>
            </select>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Determines how quantity values are displayed across logging forms.
            </p>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <FiEye />
              Goal Visibility
            </label>
            <select 
              className="input-field"
              {...register('goalVisibility')}
            >
              <option value="PRIVATE" className="bg-[var(--color-bg-secondary)]">Private (Visible only to you)</option>
              <option value="LEADERBOARD" className="bg-[var(--color-bg-secondary)]">Leaderboard (Pseudonymous entry)</option>
              <option value="PUBLIC" className="bg-[var(--color-bg-secondary)]">Public (Full name shared)</option>
            </select>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Controls whether you are displayed in the community leaderboard ranking.
            </p>
          </div>

          <button type="submit" disabled={updating} className="w-full btn-primary flex items-center justify-center gap-2">
            {updating ? <FiLoader className="animate-spin" /> : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
