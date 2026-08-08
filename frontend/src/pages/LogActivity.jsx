import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { activityService, emissionFactorService, EMISSION_FACTORS } from '../services/api';
import { toast } from 'react-toastify';
import { FiLoader, FiCheckCircle, FiInfo, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import '../styles/LogActivity.css';



import { Car, Fuel, BatteryCharging, Plane, Bus, Train, Footprints, Bike, Leaf } from 'lucide-react';

const CATEGORIES = ['TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING'];

const categoryIcons = {
  CAR_PETROL: Car,
  CAR_DIESEL: Fuel,
  CAR_ELECTRIC: BatteryCharging,
  FLIGHT_SHORT: Plane,
  FLIGHT_LONG: Plane,
  PUBLIC_TRANSIT_BUS: Bus,
  PUBLIC_TRANSIT_TRAIN: Train,
  WALKING: Footprints,
  BICYCLE: Bike,
  VEGAN_MEAL: Leaf
};


const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LogActivity() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('TRANSPORT');
  const [loading, setLoading] = useState(false);
  const [co2ePreview, setCo2ePreview] = useState(0);
  const [quickLoggingIndex, setQuickLoggingIndex] = useState(null);

  const [quickLogs, setQuickLogs] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [emissionFactors, setEmissionFactors] = useState(EMISSION_FACTORS);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: 'TRANSPORT',
      activityType: '',
      quantity: 0,
      unit: '',
      logDate: getLocalDateString(),
      notes: '',
    }
  });

  const getQuickLogDetails = (category, type) => {
    const mappings = {
      CAR_PETROL: {
        titleKey: 'quickLogPetrolCar',
        icon: Car,
        color: 'blue'
      },
     WALKING: { titleKey: 'Walking', icon: Footprints, color: 'emerald' },

      CAR_DIESEL: {
        titleKey: 'quickLogDieselCar',
        icon: Fuel,
        color: 'amber'
      },

      CAR_ELECTRIC: {
        titleKey: 'quickLogElectricCar',
        icon: BatteryCharging,
        color: 'green'
      },

      FLIGHT_SHORT_HAUL: {
        titleKey: 'quickLogShortHaulFlight',
        icon: Plane,
        color: 'sky'
      },

      FLIGHT_LONG_HAUL: {
        titleKey: 'quickLogLongHaulFlight',
        icon: Plane,
        color: 'indigo'
      },

      PUBLIC_TRANSIT_BUS: {
        titleKey: 'quickLogBusCommute',
        icon: Bus,
        color: 'cyan'
      },

      PUBLIC_TRANSIT_RAIL: {
        titleKey: 'quickLogTrainTravel',
        icon: Train,
        color: 'violet'
      },

      GRID_ELECTRICITY: {
        titleKey: 'quickLogHomePower',
        icon: BatteryCharging,
        color: 'green'
      },

      RENEWABLE_ELECTRICITY: {
        titleKey: 'quickLogRenewablePower',
        icon: BatteryCharging,
        color: 'emerald'
      },
     BICYCLE: { titleKey: 'Bicycle', icon: Bike, color: 'teal' },

      BEEF_MEAL: {
        titleKey: 'quickLogBeefMeal',
        icon: Leaf,
        color: 'red'
      },

      CHICKEN_MEAL: {
        titleKey: 'quickLogChickenMeal',
        icon: Leaf,
        color: 'orange'
      },

      VEGETARIAN_MEAL: {
        titleKey: 'quickLogVeggieMeal',
        icon: Leaf,
        color: 'teal'
      },

      VEGAN_MEAL: {
        titleKey: 'quickLogVeganMeal',
        icon: Leaf,
        color: 'lime'
      },

      CLOTHING: {
        titleKey: 'quickLogNewClothes',
        icon: Leaf,
        color: 'pink'
      },

      ELECTRONICS: {
        titleKey: 'quickLogElectronics',
        icon: Leaf,
        color: 'slate'
      },

      GENERAL_RETAIL: {
        titleKey: 'quickLogGeneralShopping',
        icon: Leaf,
        color: 'purple'
      }
    };
    return mappings[type] || {
      title: type.replace(/_/g, ' '),
      icon: Leaf,
      color: 'green'
    };
  };

  const fetchLogsAndFrequents = async () => {
    try {
      const res = await activityService.getActivities(0, 50);
      const logs = res.content || [];
      setRecentLogs(logs.slice(0, 10));

      if (logs.length === 0) {
        setQuickLogs(DEFAULT_QUICK_LOGS);
        return;
      }

      // Count frequencies
      const frequencies = {};
      logs.forEach(log => {
        const key = `${log.category}|${log.activityType}`;
        if (!frequencies[key]) {
          frequencies[key] = {
            category: log.category,
            activityType: log.activityType,
            unit: log.unit,
            quantity: log.quantity,
            count: 0
          };
        }
        frequencies[key].count += 1;
      });

      const sorted = Object.values(frequencies)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const mapped = sorted.map(item => {
          const details = getQuickLogDetails(item.category, item.activityType);

          let cardClass = item.category.toLowerCase();

            if (item.activityType === 'BICYCLE') {
              cardClass = 'bicycle';
            }

            if (item.activityType === 'WALKING') {
              cardClass = 'walking';
            }
          return {
              titleKey: details.titleKey, title: details.title, category: item.category, activityType: item.activityType,
              quantity: item.quantity, unit: item.unit, icon: details.icon, color: details.color
          };
      });

      setQuickLogs(mapped);
    } catch (err) {
      console.error(err);
      setQuickLogs(DEFAULT_QUICK_LOGS);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsAndFrequents();
  }, []);

  // The server owns the factor table. Keep the local values as an offline/loading fallback.
  useEffect(() => {
    emissionFactorService.getActiveFactors().then((factors) => {
      const mapped = factors.reduce((categories, item) => {
        const label = item.activityType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        categories[item.category] ??= {};
        categories[item.category][item.activityType] = { factor: Number(item.factor), unit: item.unit, label };
        return categories;
      }, {});
      if (Object.keys(mapped).length) setEmissionFactors(mapped);
    }).catch(() => {/* preview remains usable with the bundled fallback */});
  }, []);

  const handleQuickLog = async (item, index) => {
    setQuickLoggingIndex(index);
    const itemTitle = item.titleKey ? t(item.titleKey) : item.title;
    try {
      const payload = {
        category: item.category,
        activityType: item.activityType,
        quantity: Number(item.quantity),
        unit: item.unit,
        logDate: getLocalDateString(),
        notes: `${t('quickLogPrefix')}: ${itemTitle}`
      };
      await activityService.logActivity(payload);
      toast.success(t('quickLogSuccessToast', { quantity: item.quantity, unit: item.unit.toLowerCase(), title: itemTitle.toLowerCase() }));
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToLogActivity'));
    } finally {
      setQuickLoggingIndex(null);
    }
  };

  const handleDeleteActivity = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await activityService.deleteActivity(id);
      toast.success(t('activityDeletedSuccess'));
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToDeleteActivity'));
    }
  };

  const handleLogAgain = async (log) => {
    const details = getQuickLogDetails(log.category, log.activityType);
    const title = details.titleKey ? t(details.titleKey) : details.title;
    try {
      const payload = {
        category: log.category,
        activityType: log.activityType,
        quantity: Number(log.quantity),
        unit: log.unit,
        logDate: getLocalDateString(),
        notes: `${t('loggedAgainPrefix')}: ${title}`
      };
      await activityService.logActivity(payload);
      toast.success(t('loggedAgainSuccess', { quantity: log.quantity, unit: log.unit.toLowerCase() }));
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToLogAgain'));
    }
  };

  const selectedActivityType = watch('activityType');
  const quantityInput = watch('quantity');

  // Set category in form when activeCategory state changes
  useEffect(() => {
    setValue('category', activeCategory);
    // Reset activityType and unit to first option of new category
    const options = Object.keys(emissionFactors[activeCategory] || {});
    if (options.length > 0) {
      setValue('activityType', options[0]);
      setValue('unit', emissionFactors[activeCategory][options[0]].unit);
    }
  }, [activeCategory, emissionFactors, setValue]);

  // Update unit label when selectedActivityType changes
  useEffect(() => {
    if (selectedActivityType && emissionFactors[activeCategory]?.[selectedActivityType]) {
      setValue('unit', emissionFactors[activeCategory][selectedActivityType].unit);
    }
  }, [selectedActivityType, activeCategory, emissionFactors, setValue]);

  // Compute real-time CO2e preview instantly
  useEffect(() => {
    if (selectedActivityType && quantityInput && !isNaN(quantityInput)) {
      const entry = emissionFactors[activeCategory]?.[selectedActivityType];
      if (entry) {
        const preview = Number(quantityInput) * entry.factor;
        setCo2ePreview(preview.toFixed(3));
        return;
      }
    }
    setCo2ePreview(0);
  }, [selectedActivityType, quantityInput, activeCategory, emissionFactors]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        quantity: Number(data.quantity),
      };
      await activityService.logActivity(payload);
      toast.success(t('activityLoggedSuccess'));
      // Keep category and reset form
      reset({
        category: activeCategory,
        activityType: Object.keys(emissionFactors[activeCategory] || {})[0] || '',
        quantity: 0,
        unit: emissionFactors[activeCategory]?.[Object.keys(emissionFactors[activeCategory] || {})[0]]?.unit || '',
        logDate: getLocalDateString(),
        notes: '',
      });
      setCo2ePreview(0);
      fetchLogsAndFrequents();
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToLogActivity'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full fade-in pb-12 flex-1 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

        {/* Left Side: Logger Actions & Carousel */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 flex flex-col">
          {/* Capsule Track Tab Navigation */}
          <div className="flex p-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-inner">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer text-center capitalize border-none ${
                  activeCategory === cat
                    ? 'bg-[var(--color-accent)] text-white shadow-sm font-outfit'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {t(`categories.${cat.toLowerCase()}`)}
              </button>
            ))}
          </div>

          {/* Quick-Log Carousel */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-muted)] pl-1">
              {t('frequentlyLoggedQuickLog')}
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {quickLogs.map((item, idx) => (

                <div
                  key={idx}
                  onClick={() => quickLoggingIndex === null && handleQuickLog(item, idx)}

                  className={`quick-log-card ${
                    item.activityType === 'BICYCLE'
                      ? 'bicycle'
                      : item.activityType === 'WALKING'
                      ? 'walking'
                      : item.activityType === 'PUBLIC_TRANSIT_RAIL'
                        ? 'train'
                        : item.activityType === 'FLIGHT_LONG_HAUL'
                        ? 'flight'
                      : item.category.toLowerCase()
                  } flex-shrink-0 w-44 p-4 flex flex-col justify-between cursor-pointer relative transition-all duration-300 ${
                    quickLoggingIndex === idx ? 'opacity-70 pointer-events-none' : ''
                  }`}>
                  <div className="flex justify-between items-start">
                    {(() => {
                      const Icon = item.icon;
                      return (
                        <div className={`quick-log-icon ${item.color}`}>
                          <Icon size={22} strokeWidth={2} />
                        </div>
                      );
                    })()}
                    <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 tracking-wider">
                      {t(`categories.${item.category.toLowerCase()}`)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h5 className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                      {item.titleKey ? t(item.titleKey) : item.title}
                    </h5>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{item.quantity} {item.unit.toLowerCase()}</p>
                  </div>

                  {quickLoggingIndex === idx && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <FiLoader className="animate-spin text-[var(--color-accent)]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Log Form Card */}
          <div className="glass-card p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold font-outfit mb-6 text-[var(--color-text-primary)] capitalize">
              {t('logActivityTitle', { category: t(`categories.${activeCategory.toLowerCase()}`) })}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">{t('activityTypeLabel')}</label>
                  <select
                    className="input-field"
                    {...register('activityType', { required: t('activityTypeRequired') })}
                  >
                    {Object.entries(emissionFactors[activeCategory] || {}).map(([key, value]) => (
                      <option key={key} value={key} className="bg-[var(--color-bg-secondary)]">
                        {t(`activityTypes.${key}`, { defaultValue: value.label })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">{t('quantityLabel')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="input-field pr-16"
                      onKeyDown={(event) => {
                        if (['-', '+', 'e', 'E'].includes(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      {...register('quantity', {
                        required: t('quantityRequired'),
                        min: { value: 0, message: t('quantityCannotBeNegative') }
                      })}
                    />
                    <span className="absolute right-3 top-3 text-xs font-semibold text-[var(--color-text-secondary)]">
                      {watch('unit')}
                    </span>
                  </div>
                  {errors.quantity && <p className="error-text">{errors.quantity.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">{t('dateLabel')}</label>
                  <input
                    type="date"
                    className="input-field text-xs"
                    {...register('logDate', { required: t('dateRequired') })}
                  />
                </div>

                <div>
                  <label className="label">{t('notesOptionalLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('notesPlaceholder')}
                    className="input-field"
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Real-time preview */}
              {co2ePreview > 0 && (
                <div className="p-4 bg-[var(--color-accent-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between glow-green">
                  <div className="flex items-center gap-2">
                    <FiInfo className="text-[var(--color-accent)] text-sm shrink-0" />
                    <span className="text-xs text-[var(--color-text-secondary)]">{t('co2FootprintPreview')}</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-accent-muted)] flex items-center gap-1">
                    <FiCheckCircle />
                    {co2ePreview} {t('kgCo2e')}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? <FiLoader className="animate-spin" /> : t('saveActivityLog')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Activity Log History Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col">
          <div className="glass-card p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]/50">
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--color-text-secondary)]">{t('recentActivityLogs')}</h3>
              <span className="text-[10px] text-[var(--color-text-muted)] font-bold">{t('loggedCount', { count: recentLogs.length })}</span>
            </div>

            {historyLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {recentLogs.map((log) => {
                  const details = getQuickLogDetails(log.category, log.activityType);
                  return (
                    <div key={log.id} className="p-3 bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] rounded-xl flex items-center justify-between group hover:border-[var(--color-accent)]/20 transition-all duration-300">
                     <div className="flex items-center gap-3 overflow-hidden">
                       {(() => {
                         const Icon = details.icon;
                         return (
                           <div className={`activity-icon ${details.color}`}>
                             <Icon size={18} strokeWidth={2} />
                           </div>
                         );
                       })()}

                       <div className="min-w-0">
                         <p className="font-medium truncate">{details.title}</p>
                         <p className="text-xs text-slate-400 truncate">
                           {new Date(log.logDate).toLocaleDateString()} • {log.quantity} {log.unit}
                         </p>
                       </div>
                     </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-[var(--color-accent-muted)]">{log.co2eKg} {t('kgUnit')}</span>
                        <button
                          onClick={() => handleLogAgain(log)}
                          className="text-slate-400 hover:text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                          title={t('logThisAgain')}
                        >
                          <FiRefreshCw className="text-[10px]" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(log.id)}
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                          title={t('deleteLog')}
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
                <FiInfo className="text-xl mx-auto mb-2 text-[var(--color-text-muted)]" />
                {t('noLoggedActivitiesFound')}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-xl">
              <FiTrash2 />
            </div>
            <h4 className="font-bold text-base text-[var(--color-text-primary)] mb-2 font-outfit">{t('deleteActivityLogTitle')}</h4>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-6">
              {t('deleteActivityLogConfirm')}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  executeDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-grow py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/10 cursor-pointer"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}