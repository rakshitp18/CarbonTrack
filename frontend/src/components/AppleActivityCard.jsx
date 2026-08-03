import { motion } from "framer-motion";
import { FiInfo } from "react-icons/fi";

const CATEGORY_GRADIENTS = {
  TRANSPORT: { start: "#10B981", end: "#34D399" },    // Emerald
  ELECTRICITY: { start: "#06B6D4", end: "#38BDF8" },  // Cyan / Sky
  FOOD: { start: "#F59E0B", end: "#FBBF24" },         // Amber
  SHOPPING: { start: "#EF4444", end: "#F87171" },     // Rose
  SERVICES: { start: "#8B5CF6", end: "#A78BFA" },     // Purple
  OTHER: { start: "#64748B", end: "#94A3B8" },        // Slate
};

const CircleProgress = ({ data, index }) => {
  const strokeWidth = 14;
  const radius = (data.size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((100 - Math.min(100, Math.max(0, data.value))) / 100) * circumference;

  const gradientId = `gradient-${data.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const gradientUrl = `url(#${gradientId})`;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
    >
      <div className="relative">
        <svg
          aria-label={`${data.label} Activity Progress - ${data.value}%`}
          className="-rotate-90 transform"
          height={data.size}
          viewBox={`0 0 ${data.size} ${data.size}`}
          width={data.size}
        >
          <title>{`${data.label} Activity Progress - ${data.value}%`}</title>

          <defs>
            <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: data.colorStart,
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: data.colorEnd,
                  stopOpacity: 1,
                }}
              />
            </linearGradient>
          </defs>

          <circle
            className="stroke-slate-200/50 dark:stroke-slate-800/60"
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            r={radius}
            strokeWidth={strokeWidth}
          />

          <motion.circle
            animate={{ strokeDashoffset: progress }}
            cx={data.size / 2}
            cy={data.size / 2}
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            stroke={gradientUrl}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{
              filter: "drop-shadow(0 0 6px rgba(0,0,0,0.2))",
            }}
            transition={{
              duration: 1.6,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default function AppleActivityCard({ pieData = [], title = "Emissions by Category" }) {
  // If pieData is empty, render zero state
  if (!pieData || pieData.length === 0) {
    return (
      <div className="glass-card p-6 h-full flex flex-col justify-between">
        <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">{title}</h3>
        <div className="h-56 flex flex-col items-center justify-center text-[var(--color-text-muted)] text-sm">
          <FiInfo className="text-2xl mb-2 text-emerald-500" />
          No carbon activities logged in the last 30 days.
        </div>
      </div>
    );
  }

  // Calculate total emissions across categories
  const totalEmissions = pieData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Sizes for concentric activity rings: 200px, 160px, 120px, 80px
  const sizes = [200, 160, 120, 80];

  // Map pieData to activity rings data
  const activities = pieData.slice(0, 4).map((item, index) => {
    const categoryName = item.name.toUpperCase();
    const grad = CATEGORY_GRADIENTS[categoryName] || { start: "#10B981", end: "#34D399" };
    const percentage = Math.round((item.value / totalEmissions) * 100);

    return {
      label: categoryName,
      value: Math.max(8, percentage), // Minimum 8% ring visibility for aesthetic balance
      colorStart: grad.start,
      colorEnd: grad.end,
      size: sizes[index] || (200 - index * 35),
      current: item.value,
      unit: "KG",
    };
  });

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full relative overflow-hidden">
      <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--color-text-secondary)] mb-4">
        {title}
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
        {/* Concentric Activity Rings */}
        <div className="relative h-[200px] w-[200px] shrink-0">
          {activities.map((activity, index) => (
            <CircleProgress
              data={activity}
              index={index}
              key={activity.label}
            />
          ))}
        </div>

        {/* Detailed Activity Info Legend */}
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-3.5 flex-1 min-w-[160px]"
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {activities.map((activity) => (
            <div className="flex items-center justify-between gap-3" key={activity.label}>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: activity.colorStart }}
                />
                <span className="font-semibold text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
                  {activity.label}
                </span>
              </div>
              <span
                className="font-bold text-sm font-outfit"
                style={{ color: activity.colorStart }}
              >
                {activity.current}
                <span className="ml-1 text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                  {activity.unit}
                </span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
