import { useEffect, useState } from 'react';
import { leaderboardService } from '../services/api';
import { toast } from 'react-toastify';
import { FiAward, FiInfo, FiSmile, FiCheckCircle } from 'react-icons/fi';
import { badges } from "../data/badges";

const getBadgeIcon = (badgeName) => {
  const meta = {
    'Green Commuter': '🚗🌱',
    'Eco Warrior': '🚴🌲',
    'Planet Protector': '👑🌍',
    'First Step': '👣✨',
    'Carbon Saver 10': '🌱🔋',
    'Carbon Saver 25': '🌲🌳',
    'Carbon Saver 50': '🌎🛡️',
  };
  return meta[badgeName] || '🏆';
};
const getBadgeImage = (badgeName) => {
  return badges.find((b) => b.title === badgeName)?.image;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserIds, setExpandedUserIds] = useState({});

  const toggleHabits = (userId) => {
    setExpandedUserIds((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await leaderboardService.getLeaderboard();
        setEntries(data);
      } catch (err) {
        toast.error('Failed to load leaderboard entries');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 fade-in flex-1 flex flex-col">
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FiAward className="text-2xl text-[var(--color-accent)]" />
          <h3 className="text-xl font-bold font-outfit text-[var(--color-text-primary)]">Community Leaderboard</h3>
        </div>

        {/* Podium for Top 3 Champions */}
        {entries.length > 0 && (
          <div className="mb-12 pb-8 border-b border-[var(--color-border)]/60">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-8">
              🏆 Top Carbon Savers Podium
            </h4>

            <div className="flex flex-col md:flex-row items-end justify-center gap-4 max-w-4xl mx-auto px-4">
              {/* 2nd Place - Silver Medal */}
              {entries[1] ? (
                <div className="order-2 md:order-1 flex-1 w-full flex flex-col items-center">
                  <div className="flex flex-col items-center mb-3 text-center">
                    <span className="text-2xl mb-1 animate-bounce" title="Silver Medal">🥈</span>
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-200 shadow-[0_0_20px_rgba(203,213,225,0.4)] mb-2 overflow-hidden">
                      {entries[1].profilePhoto ? (
                        <img src={entries[1].profilePhoto} alt={entries[1].username} className="w-full h-full object-cover" />
                      ) : (
                        entries[1].username?.charAt(0).toUpperCase() || '2'
                      )}
                    </div>
                    <h5 className="font-outfit font-bold text-sm text-[var(--color-text-primary)] truncate max-w-[140px]">
                      {entries[1].username}
                    </h5>
                    {entries[1].selectedBadge && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 mt-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300/40 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {getBadgeIcon(entries[1].selectedBadge)} {entries[1].selectedBadge}
                      </span>
                    )}
                    <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-extrabold text-[var(--color-accent)]">
                      {entries[1].averageDailyEmission} <span className="text-[9px] font-normal text-[var(--color-text-muted)]">kg/day</span>
                    </span>
                  </div>
                  {/* Podium Stand */}
                  <div className="w-full h-28 bg-gradient-to-t from-slate-400/25 via-slate-300/10 to-transparent border-t-4 border-slate-300 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-inner">
                    <span className="text-xl font-extrabold font-outfit text-slate-400">2nd</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Silver Medal</span>
                  </div>
                </div>
              ) : null}

              {/* 1st Place - Gold Medal (Center & Tallest) */}
              {entries[0] ? (
                <div className="order-1 md:order-2 flex-1 w-full flex flex-col items-center -mt-6">
                  <div className="flex flex-col items-center mb-3 text-center">
                    <span className="text-3xl mb-1 animate-bounce" title="Gold Medal">🥇</span>
                    <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/50 border-4 border-yellow-400 flex items-center justify-center font-extrabold text-2xl text-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] mb-2 relative overflow-hidden">
                      {entries[0].profilePhoto ? (
                        <img src={entries[0].profilePhoto} alt={entries[0].username} className="w-full h-full object-cover" />
                      ) : (
                        entries[0].username?.charAt(0).toUpperCase() || '1'
                      )}
                      <span className="absolute top-0 right-0 text-sm">👑</span>
                    </div>
                    <h5 className="font-outfit font-extrabold text-base text-[var(--color-text-primary)] truncate max-w-[160px]">
                      {entries[0].username}
                    </h5>
                    {entries[0].selectedBadge && (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 mt-1 rounded-full bg-amber-500/10 border border-yellow-400/40 text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                        {getBadgeIcon(entries[0].selectedBadge)} {entries[0].selectedBadge}
                      </span>
                    )}
                    <span className="mt-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-primary)] border border-yellow-400/40 text-xs font-black text-amber-500 shadow-sm">
                      {entries[0].averageDailyEmission} <span className="text-[9px] font-normal text-[var(--color-text-muted)]">kg/day</span>
                    </span>
                  </div>
                  {/* Podium Stand */}
                  <div className="w-full h-36 bg-gradient-to-t from-amber-500/30 via-yellow-500/15 to-transparent border-t-4 border-yellow-400 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-lg">
                    <span className="text-2xl font-black font-outfit text-yellow-500">1st</span>
                    <span className="text-[10px] font-extrabold text-yellow-500 uppercase tracking-wider">Gold Champion</span>
                  </div>
                </div>
              ) : null}

              {/* 3rd Place - Bronze Medal */}
              {entries[2] ? (
                <div className="order-3 md:order-3 flex-1 w-full flex flex-col items-center">
                  <div className="flex flex-col items-center mb-3 text-center">
                    <span className="text-2xl mb-1 animate-bounce" title="Bronze Medal">🥉</span>
                    <div className="w-16 h-16 rounded-full bg-amber-900/10 border-2 border-amber-600 flex items-center justify-center font-bold text-lg text-amber-700 dark:text-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.4)] mb-2 overflow-hidden">
                      {entries[2].profilePhoto ? (
                        <img src={entries[2].profilePhoto} alt={entries[2].username} className="w-full h-full object-cover" />
                      ) : (
                        entries[2].username?.charAt(0).toUpperCase() || '3'
                      )}
                    </div>
                    <h5 className="font-outfit font-bold text-sm text-[var(--color-text-primary)] truncate max-w-[140px]">
                      {entries[2].username}
                    </h5>
                    {entries[2].selectedBadge && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 mt-1 rounded-full bg-amber-900/10 border border-amber-600/30 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        {getBadgeIcon(entries[2].selectedBadge)} {entries[2].selectedBadge}
                      </span>
                    )}
                    <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-xs font-extrabold text-[var(--color-accent)]">
                      {entries[2].averageDailyEmission} <span className="text-[9px] font-normal text-[var(--color-text-muted)]">kg/day</span>
                    </span>
                  </div>
                  {/* Podium Stand */}
                  <div className="w-full h-24 bg-gradient-to-t from-amber-700/25 via-amber-700/10 to-transparent border-t-4 border-amber-600 rounded-t-2xl flex flex-col items-center justify-center p-3 shadow-inner">
                    <span className="text-xl font-extrabold font-outfit text-amber-600">3rd</span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Bronze Medal</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Avg Daily Footprint</th>
                <th className="py-3 px-4">Category Strength</th>
                <th className="py-3 px-4">Badges</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 3 ? (
                entries.slice(3).map((entry, index) => {
                  const rank = index + 4;
                  return (
                    <tr key={entry.userId} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors">
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full font-extrabold text-xs bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                          #{rank}
                        </span>
                      </td>
                      
                      {/* Username & Collapsible Habits */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)] shrink-0 overflow-hidden shadow-sm">
                              {entry.profilePhoto ? (
                                <img src={entry.profilePhoto} alt={entry.username} className="w-full h-full object-cover" />
                              ) : (
                                entry.username?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[var(--color-text-primary)]">{entry.username}</span>
                              {entry.selectedBadge && (
                                <span 
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20 text-[9px] font-bold text-[var(--color-accent-muted)]"
                                  title={entry.selectedBadge}
                                >
                                  {getBadgeIcon(entry.selectedBadge)} {entry.selectedBadge}
                                </span>
                              )}
                            </div>
                          </div>
                          {entry.habitTips && entry.habitTips.length > 0 && (
                            <div className="mt-1">
                              <button
                                onClick={() => toggleHabits(entry.userId)}
                                className="text-[10px] text-[var(--color-accent)] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none outline-none p-0"
                              >
                                {expandedUserIds[entry.userId] ? 'Hide Habits' : 'Follow Habits'}
                              </button>
                              {expandedUserIds[entry.userId] && (
                                <div className="mt-2 bg-slate-50 border border-slate-200/40 p-2.5 rounded-xl flex flex-col gap-1.5 animate-slide-in">
                                  {entry.habitTips.map((habit, hIdx) => (
                                    <span key={hIdx} className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0"></span>
                                      {habit}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Average daily */}
                      <td className="py-4 px-4 font-bold text-[var(--color-text-primary)]">
                        {entry.averageDailyEmission} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">kg/day</span>
                      </td>

                      {/* Category Strength */}
                      <td className="py-4 px-4 text-[var(--color-text-secondary)]">
                        {entry.categoryStrength}
                      </td>

                      {/* Badges list */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {entry.badges.length > 0 ? (
                            entry.badges.map((badge, bIdx) => (
                              <div
                                key={bIdx}
                                className="flex items-center gap-1 bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20 rounded-md px-2 py-1"
                              >
                                <img
                                  src={getBadgeImage(badge)}
                                  alt={badge}
                                  className="w-8 h-8 object-contain"
                                />

                                <span className="text-[9px] font-semibold text-[var(--color-accent-muted)]">
                                  {badge}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-[var(--color-text-muted)]">No badges yet</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[var(--color-text-muted)]">
                    <FiInfo className="text-xl mx-auto mb-2 text-[var(--color-text-muted)]" />
                    {entries.length > 0
                      ? "All current community leaders are featured on the podium above."
                      : "No leaderboard profiles available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
