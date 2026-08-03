import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiCheck, FiX, FiSmile } from 'react-icons/fi';
import { renderToStaticMarkup } from 'react-dom/server';

// RGB values for the per-avatar color ring on the stage
const AVATAR_RGB = {
  1: '255, 0, 91',
  2: '255, 125, 16',
  3: '16, 185, 129',
  4: '137, 252, 179',
  5: '6, 182, 212',
  6: '245, 158, 11',
};

const avatars = [
  {
    id: 1,
    alt: 'Sunset Coral',
    svg: (
      <svg aria-label="Sunset Coral" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-1" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-1)">
          <rect fill="#ff005b" height="36" width="36" />
          <rect fill="#ffb238" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18)" width="36" x="0" y="0" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" width="1.5" x="10" y="14" />
            <rect fill="#000000" height="2" rx="1" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 2,
    alt: 'Flame Ember',
    svg: (
      <svg aria-label="Flame Ember" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-2" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-2)">
          <rect fill="#ff7d10" height="36" width="36" />
          <rect fill="#0a0310" height="36" rx="6" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" width="36" x="0" y="0" />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" stroke="#FFFFFF" strokeLinecap="round" />
            <rect fill="#FFFFFF" height="2" rx="1" width="1.5" x="14" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" width="1.5" x="20" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 3,
    alt: 'Eco Emerald',
    svg: (
      <svg aria-label="Eco Emerald" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-3" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-3)">
          <rect fill="#064e3b" height="36" width="36" />
          <rect fill="#10b981" height="36" rx="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" width="36" x="0" y="0" />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
            <rect fill="#FFFFFF" height="2" rx="1" width="1.5" x="12" y="14" />
            <rect fill="#FFFFFF" height="2" rx="1" width="1.5" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 4,
    alt: 'Mint Sprout',
    svg: (
      <svg aria-label="Mint Sprout" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-4" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-4)">
          <rect fill="#d8fcb3" height="36" width="36" />
          <rect fill="#89fcb3" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" width="36" x="0" y="0" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" height="2" rx="1" width="1.5" x="10" y="14" />
            <rect fill="#000000" height="2" rx="1" width="1.5" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 5,
    alt: 'Cyan Wave',
    svg: (
      <svg aria-label="Cyan Wave" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-5" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-5)">
          <rect fill="#0891b2" height="36" width="36" />
          <rect fill="#67e8f9" height="36" rx="18" transform="translate(4 4) rotate(140 18 18)" width="36" x="0" y="0" />
          <g transform="translate(5 -3) rotate(0 18 18)">
            <path d="M14 20c2 1 4 1 6 0" stroke="#0e7490" strokeLinecap="round" />
            <rect fill="#0e7490" height="2" rx="1" width="1.5" x="11" y="14" />
            <rect fill="#0e7490" height="2" rx="1" width="1.5" x="23" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 6,
    alt: 'Solar Sun',
    svg: (
      <svg aria-label="Solar Sun" fill="none" height="40" width="40" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <mask height="36" id="av-mask-6" maskUnits="userSpaceOnUse" width="36" x="0" y="0">
          <rect fill="#FFFFFF" height="36" rx="72" width="36" />
        </mask>
        <g mask="url(#av-mask-6)">
          <rect fill="#f59e0b" height="36" width="36" />
          <rect fill="#fef08a" height="36" rx="12" transform="translate(-4 4) rotate(45 18 18)" width="36" x="0" y="0" />
          <g transform="translate(2 -2)">
            <path d="M14 20c2 1.5 4 1.5 6 0" stroke="#78350f" strokeLinecap="round" />
            <rect fill="#78350f" height="2" rx="1" width="1.5" x="11" y="14" />
            <rect fill="#78350f" height="2" rx="1" width="1.5" x="23" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
];

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const thumbnailVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function AvatarPicker({ onSelectAvatar, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[2]); // Default to Eco Emerald
  const shouldReduceMotion = useReducedMotion();

  const handleAvatarSelect = (avatar) => {
    if (avatar.id === selectedAvatar.id) return;
    setSelectedAvatar(avatar);
  };

  const handleApply = () => {
    // Convert React SVG component to base64 Data URL
    const svgString = renderToStaticMarkup(selectedAvatar.svg);
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    if (onSelectAvatar) {
      onSelectAvatar(dataUrl);
    }
  };

  const rgb = AVATAR_RGB[selectedAvatar.id] || '16, 185, 129';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative mx-auto w-full max-w-[420px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-100 font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
        >
          <FiX className="text-lg" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <FiSmile /> Custom Preset Avatars
            </div>
            <h2 className="font-bold text-xl tracking-tight text-slate-100 font-outfit">
              Pick Your Avatar
            </h2>
            <p className="text-slate-400 text-xs">
              Choose an animated preset avatar for your profile
            </p>
          </div>

          {/* Avatar Stage */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-36 w-36">
              {/* Animated per-avatar color ring */}
              <motion.div
                animate={{
                  boxShadow: `0 0 0 3px rgba(${rgb}, 0.65), 0 8px 28px rgba(${rgb}, 0.25)`,
                }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
              />

              {/* Avatar circle stage */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-slate-700/60 bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={selectedAvatar.id}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="scale-[3.6] transform">
                      {selectedAvatar.svg}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Avatar name badge */}
            <AnimatePresence mode="wait">
              <motion.span
                animate={{ opacity: 1 }}
                className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.14em]"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key={selectedAvatar.id}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}
              >
                {selectedAvatar.alt}
              </motion.span>
            </AnimatePresence>

            {/* Thumbnail Strip */}
            <motion.div
              animate="animate"
              className="flex gap-2.5 flex-wrap justify-center pt-2"
              initial="initial"
              variants={containerVariants}
            >
              {avatars.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                return (
                  <motion.button
                    aria-label={`Select ${avatar.alt}`}
                    aria-pressed={isSelected}
                    className={`relative h-12 w-12 rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-slate-900 opacity-100 scale-105'
                        : 'border-slate-700 bg-slate-800/80 opacity-50 hover:opacity-100 hover:border-slate-600'
                    }`}
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    type="button"
                    variants={thumbnailVariants}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="scale-[2.1] transform">{avatar.svg}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                        <FiCheck className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              type="button"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FiCheck className="text-sm" /> Apply Avatar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
