import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FiMapPin, 
  FiNavigation, 
  FiRepeat, 
  FiSearch, 
  FiZap, 
  FiCheckCircle, 
  FiClock, 
  FiCompass,
  FiTrendingDown,
  FiAward,
  FiX,
  FiShield
} from 'react-icons/fi';
import { 
  FaWalking, 
  FaBicycle, 
  FaTrain, 
  FaBus, 
  FaCar, 
  FaLeaf 
} from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

import { routeService, activityService } from '../services/api';

// Custom Leaflet Pin Icons with Animated Pulse Rings
const createCustomIcon = (color, pulseColor) => {
  return L.divIcon({
    className: 'custom-map-marker-wrapper',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${pulseColor};
          opacity: 0.35;
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 2px solid white;
          position: relative;
          z-index: 10;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const originIcon = createCustomIcon('#10b981', 'rgba(16, 185, 129, 0.4)'); // Emerald green
const destIcon = createCustomIcon('#ef4444', 'rgba(239, 68, 68, 0.4)');     // Red

// Pure Native Leaflet Map Component
function OpenStreetMapComponent({ origin, destination, originCoords, destCoords, routePolyline }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [originCoords?.lat || 28.6315, originCoords?.lon || 77.2167],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    layerGroup.clearLayers();

    if (originCoords && destCoords) {
      const origMarker = L.marker([originCoords.lat, originCoords.lon], { icon: originIcon })
        .bindPopup(`<div style="font-family: sans-serif; font-size: 12px; padding: 2px;"><strong>Start Location:</strong><br/>${origin}</div>`);
      
      const destMarker = L.marker([destCoords.lat, destCoords.lon], { icon: destIcon })
        .bindPopup(`<div style="font-family: sans-serif; font-size: 12px; padding: 2px;"><strong>Destination:</strong><br/>${destination}</div>`);

      layerGroup.addLayer(origMarker);
      layerGroup.addLayer(destMarker);

      const path = (routePolyline && routePolyline.length > 0)
        ? routePolyline
        : [[originCoords.lat, originCoords.lon], [destCoords.lat, destCoords.lon]];

      const polyline = L.polyline(path, {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      });
      layerGroup.addLayer(polyline);

      const bounds = L.latLngBounds([
        [originCoords.lat, originCoords.lon],
        [destCoords.lat, destCoords.lon]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, originCoords, destCoords, routePolyline]);

  return <div ref={mapRef} className="w-full h-full min-h-[380px] rounded-xl overflow-hidden shadow-inner" />;
}

export default function RouteOptimizer() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loggingMode, setLoggingMode] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedModeKey, setSelectedModeKey] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Search autocomplete timers
  const originTimer = useRef(null);
  const destTimer = useRef(null);

  const handleOriginChange = (val) => {
    setOrigin(val);
    setShowOriginDropdown(true);
    if (originTimer.current) clearTimeout(originTimer.current);
    originTimer.current = setTimeout(async () => {
      if (val.trim().length >= 3) {
        const res = await routeService.searchLocation(val);
        setOriginSuggestions(res);
      } else {
        setOriginSuggestions([]);
      }
    }, 350);
  };

  const handleDestChange = (val) => {
    setDestination(val);
    setShowDestDropdown(true);
    if (destTimer.current) clearTimeout(destTimer.current);
    destTimer.current = setTimeout(async () => {
      if (val.trim().length >= 3) {
        const res = await routeService.searchLocation(val);
        setDestSuggestions(res);
      } else {
        setDestSuggestions([]);
      }
    }, 350);
  };

  const selectOriginSuggestion = (item) => {
    setOrigin(item.display_name);
    setOriginCoords({ lat: item.lat, lon: item.lon });
    setShowOriginDropdown(false);
  };

  const selectDestSuggestion = (item) => {
    setDestination(item.display_name);
    setDestCoords({ lat: item.lat, lon: item.lon });
    setShowDestDropdown(false);
  };

  const swapLocations = () => {
    const tempOrig = origin;
    const tempOrigCoords = originCoords;
    setOrigin(destination);
    setOriginCoords(destCoords);
    setDestination(tempOrig);
    setDestCoords(tempOrigCoords);
  };

  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      toast.error('Please enter both starting location and destination.');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch real OpenStreetMap OSRM road polyline & distance
      let osrmDistanceKm = null;
      if (originCoords && destCoords) {
        const osrmData = await routeService.fetchOSRMRoute(originCoords, destCoords);
        if (osrmData && osrmData.coordinates) {
          setRoutePolyline(osrmData.coordinates);
          osrmDistanceKm = osrmData.distanceKm;
        } else {
          setRoutePolyline([[originCoords.lat, originCoords.lon], [destCoords.lat, destCoords.lon]]);
        }
      }

      // 2. Call CarbonTrack backend optimization engine
      const payload = {
        origin,
        destination,
        originLat: originCoords ? originCoords.lat : null,
        originLng: originCoords ? originCoords.lon : null,
        destLat: destCoords ? destCoords.lat : null,
        destLng: destCoords ? destCoords.lon : null,
        distanceKm: osrmDistanceKm
      };

      const res = await routeService.optimizeRoute(payload);
      setResult(res);
      if (res.routes && res.routes.length > 0) {
        setSelectedModeKey(res.routes[0].activityType);
      }
      toast.success('Optimal routes calculated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to calculate routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogRouteActivity = async (route) => {
    setLoggingMode(route.activityType);
    try {
      await activityService.logActivity({
        category: 'TRANSPORT',
        activityType: route.activityType,
        quantity: route.distanceKm,
        unit: 'KM',
        logDate: new Date().toISOString().split('T')[0],
        notes: `Route Commute: ${origin.split(',')[0]} → ${destination.split(',')[0]} (${route.modeTitle})`
      });
      toast.success(`Logged ${route.distanceKm} km ${route.modeTitle} commute! 🍀`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setLoggingMode(null);
    }
  };

  const getModeIcon = (activityType) => {
    switch (activityType) {
      case 'WALKING':
        return <FaWalking className="text-xl text-[var(--color-accent)]" />;
      case 'BICYCLE':
        return <FaBicycle className="text-xl text-[var(--color-accent)]" />;
      case 'PUBLIC_TRANSIT_RAIL':
        return <FaTrain className="text-xl text-cyan-600 dark:text-cyan-400" />;
      case 'PUBLIC_TRANSIT_BUS':
        return <FaBus className="text-xl text-blue-600 dark:text-blue-400" />;
      case 'CAR_ELECTRIC':
        return <FaLeaf className="text-xl text-teal-600 dark:text-teal-400" />;
      case 'CAR_DIESEL':
      case 'CAR_PETROL':
      default:
        return <FaCar className="text-xl text-amber-600 dark:text-amber-400" />;
    }
  };

  const getEcoScoreBadge = (score) => {
    switch (score) {
      case 'ZERO_EMISSION':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 flex items-center gap-1.5 font-outfit shadow-sm">
            <FaLeaf className="text-emerald-600 dark:text-emerald-400" /> Zero Emission
          </span>
        );
      case 'LOW_EMISSION':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50 flex items-center gap-1 font-outfit shadow-sm">
            <FiShield className="text-cyan-600 dark:text-cyan-400" /> Low Footprint
          </span>
        );
      case 'MODERATE_EMISSION':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 font-outfit shadow-sm">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 font-outfit shadow-sm">
            High Emission
          </span>
        );
    }
  };

  // Presets handler
  const setPreset = (origStr, destStr, oCoords, dCoords) => {
    setOrigin(origStr);
    setDestination(destStr);
    setOriginCoords(oCoords);
    setDestCoords(dCoords);
  };

  // Filtered routes list
  const getFilteredRoutes = () => {
    if (!result || !result.routes) return [];
    if (filterCategory === 'ZERO_EMISSION') {
      return result.routes.filter(r => r.co2eKg === 0);
    }
    if (filterCategory === 'TRANSIT') {
      return result.routes.filter(r => r.activityType.includes('PUBLIC_TRANSIT'));
    }
    if (filterCategory === 'VEHICLE') {
      return result.routes.filter(r => r.activityType.includes('CAR'));
    }
    return result.routes;
  };

  // Calculate baseline petrol car value for comparison gauge
  const baselinePetrolCo2e = result?.routes?.find(r => r.activityType === 'CAR_PETROL')?.co2eKg || 1.0;

  return (
    <div className="space-y-8 w-full pb-16 flex-1 flex flex-col">
      {/* Header Banner - Clean Professional Layout */}
      <div className="rounded-2xl p-6 md:p-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-accent)] text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 font-outfit shadow-sm">
                <FiCompass className="animate-spin-slow" /> OpenStreetMap OSRM Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 font-outfit shadow-sm">
                <FiShield /> EPA 2024 & IPCC AR6 Factor Engine
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--color-text-primary)] font-outfit tracking-tight">
              Route & Eco-Commute Optimizer
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Compare real road distances, commute durations, and precise carbon footprints across 7 transport modes. Choose zero-emission routes to reduce your carbon footprint with every trip.
            </p>
          </div>

          {/* Quick Metrics Deck */}
          <div className="grid grid-cols-2 gap-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-3.5 rounded-2xl shadow-inner min-w-[280px]">
            <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Max Carbon Saved</span>
              <span className="text-lg md:text-xl font-extrabold text-[var(--color-accent)] font-outfit mt-0.5">
                {result ? `${result.maxCarbonSavingsKg} kg` : '0.00 kg'}
              </span>
            </div>

            <div className="p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block">Eco Winner Mode</span>
              <span className="text-xs md:text-sm font-bold text-[var(--color-text-primary)] font-outfit mt-0.5 truncate">
                {result?.routes?.find(r => r.tags.includes('MOST_CARBON_EFFICIENT'))?.modeTitle || 'Zero Emission'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form & Map Visualizer - Equal Height Grid Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Search Panel & Advice Box */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <form onSubmit={handleOptimize} className="p-6 space-y-5 rounded-2xl border border-[var(--color-border)] shadow-sm bg-[var(--color-bg-card)] flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-extrabold text-[var(--color-text-primary)] flex items-center gap-2 font-outfit">
                  <FiNavigation className="text-[var(--color-accent)] text-lg" /> Plan Your Route
                </h3>
                <span className="text-xs text-[var(--color-text-muted)] font-medium">OSRM Enabled</span>
              </div>

              {/* Starting Location */}
              <div className="relative">
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 font-outfit">
                  Starting Location
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3.5 text-[var(--color-accent)] text-base" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    placeholder="e.g. Connaught Place, Delhi or Sector 17, Chandigarh"
                    className="w-full pl-10 pr-10 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all font-medium"
                  />
                  {origin && (
                    <button
                      type="button"
                      onClick={() => setOrigin('')}
                      className="absolute right-3 top-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition border-none bg-transparent cursor-pointer"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {originSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectOriginSuggestion(item)}
                          className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors flex items-center gap-2.5 border-b border-[var(--color-border)] last:border-none cursor-pointer"
                        >
                          <FiMapPin className="text-[var(--color-accent)] flex-shrink-0 text-xs" />
                          <span className="truncate">{item.display_name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Swap Locations Button */}
              <div className="flex justify-center -my-1.5 z-10 relative">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-2 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-accent)] rounded-full border border-[var(--color-border)] shadow-sm transition-all cursor-pointer"
                  title="Swap start & destination"
                >
                  <FiRepeat className="text-sm" />
                </button>
              </div>

              {/* Destination Location */}
              <div className="relative">
                <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 font-outfit">
                  Destination
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-3.5 text-rose-500 text-base" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleDestChange(e.target.value)}
                    placeholder="e.g. Cyber Hub, Gurgaon or Rajpur Road, Dehradun"
                    className="w-full pl-10 pr-10 py-3 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-medium"
                  />
                  {destination && (
                    <button
                      type="button"
                      onClick={() => setDestination('')}
                      className="absolute right-3 top-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition border-none bg-transparent cursor-pointer"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showDestDropdown && destSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {destSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectDestSuggestion(item)}
                          className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] transition-colors flex items-center gap-2.5 border-b border-[var(--color-border)] last:border-none cursor-pointer"
                        >
                          <FiMapPin className="text-rose-500 flex-shrink-0 text-xs" />
                          <span className="truncate">{item.display_name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2 pt-1">
                <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider font-outfit">Quick Indian Commute Presets:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreset('Connaught Place, New Delhi', 'Cyber Hub, Gurgaon', { lat: 28.6315, lon: 77.2167 }, { lat: 28.4950, lon: 77.0895 })}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition cursor-pointer font-medium"
                  >
                    🇮🇳 CP, Delhi → Cyber Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('Rajpur Road, Dehradun', 'Clock Tower, Dehradun', { lat: 30.3475, lon: 78.0583 }, { lat: 30.3256, lon: 78.0437 })}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition cursor-pointer font-medium"
                  >
                    🏔️ Rajpur Rd → Clock Tower
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('Sector 17, Chandigarh', 'Elante Mall, Chandigarh', { lat: 30.7398, lon: 76.7827 }, { lat: 30.7056, lon: 76.8013 })}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition cursor-pointer font-medium"
                  >
                    🌳 Sec 17 → Elante
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('Kashmere Gate ISBT, Delhi', 'Aerocity, New Delhi', { lat: 28.6665, lon: 77.2280 }, { lat: 28.5492, lon: 77.1213 })}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition cursor-pointer font-medium"
                  >
                    🚇 Kashmere Gate → Aerocity
                  </button>
                </div>
              </div>
            </div>

            {/* Optimize Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 mt-4 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none font-outfit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Computing Road Distances & Emissions...
                </>
              ) : (
                <>
                  <FiSearch className="text-base" />
                  Find Shortest & Greenest Routes
                </>
              )}
            </button>
          </form>

          {/* Advice Insight Card */}
          {result && result.recommendationAdvice && (
            <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 font-outfit">
                <FiZap className="text-sm" /> Sustainability Recommendation
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {result.recommendationAdvice}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: OpenStreetMap Visualizer */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden h-full min-h-[460px] shadow-sm relative flex flex-col bg-[var(--color-bg-card)]">
            <div className="p-3.5 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-xs font-extrabold text-[var(--color-text-primary)] flex items-center gap-2 font-outfit">
                <FiCompass className="text-[var(--color-accent)] text-base" /> OpenStreetMap Interactive Road View
              </span>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Start</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Destination</span>
              </div>
            </div>

            <div className="flex-1 relative z-0 p-2 bg-[var(--color-bg-primary)]">
              {originCoords && destCoords ? (
                <OpenStreetMapComponent
                  origin={origin}
                  destination={destination}
                  originCoords={originCoords}
                  destCoords={destCoords}
                  routePolyline={routePolyline}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-primary)] rounded-xl">
                  Enter starting location and destination above to view map route.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Deck & Route Results Section */}
      {result && result.routes && result.routes.length > 0 && (
        <div className="space-y-6 pt-2">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider block font-outfit">Eco Winner</span>
              <span className="text-base font-extrabold text-[var(--color-accent)] font-outfit mt-1 block truncate">
                {result.routes.find(r => r.tags.includes('MOST_CARBON_EFFICIENT'))?.modeTitle || 'Zero Emission'}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 block font-medium">0.00 kg CO₂e Footprint</span>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider block font-outfit">Shortest Route</span>
              <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400 font-outfit mt-1 block truncate">
                {result.routes.find(r => r.tags.includes('SHORTEST_DISTANCE'))?.distanceKm} km
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 block font-medium">
                {result.routes.find(r => r.tags.includes('SHORTEST_DISTANCE'))?.modeTitle}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider block font-outfit">Fastest Mode</span>
              <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-outfit mt-1 block truncate">
                {result.routes.find(r => r.tags.includes('FASTEST_ROUTE'))?.durationMinutes} min
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 block font-medium">
                {result.routes.find(r => r.tags.includes('FASTEST_ROUTE'))?.modeTitle}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm">
              <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider block font-outfit">Potential Savings</span>
              <span className="text-base font-extrabold text-[var(--color-accent)] font-outfit mt-1 block truncate">
                {result.maxCarbonSavingsKg} kg CO₂e
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 block font-medium">vs Petrol Car Baseline</span>
            </div>
          </div>

          {/* Section Header & Mode Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[var(--color-text-primary)] font-outfit tracking-tight">
                Travel Modes & Emissions Breakdown
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
                Showing {getFilteredRoutes().length} calculated transport options for {result.origin.split(',')[0]} → {result.destination.split(',')[0]}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-[var(--color-bg-primary)] p-1.5 rounded-xl border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none font-outfit ${
                  filterCategory === 'ALL'
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                All Modes ({result.routes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('ZERO_EMISSION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none font-outfit ${
                  filterCategory === 'ZERO_EMISSION'
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                🌱 Zero Emission
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('TRANSIT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none font-outfit ${
                  filterCategory === 'TRANSIT'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                🚆 Public Transit
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('VEHICLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none font-outfit ${
                  filterCategory === 'VEHICLE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                🚗 Vehicles
              </button>
            </div>
          </div>

          {/* Route Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredRoutes().map((route, idx) => {
              const isEcoWinner = route.tags.includes('MOST_CARBON_EFFICIENT');
              const isShortest = route.tags.includes('SHORTEST_DISTANCE');
              const isFastest = route.tags.includes('FASTEST_ROUTE');

              const intensityRatio = baselinePetrolCo2e > 0 ? Math.min(100, Math.round((route.co2eKg / baselinePetrolCo2e) * 100)) : 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedModeKey(route.activityType)}
                  className={`p-5 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between cursor-pointer bg-[var(--color-bg-card)] shadow-sm ${
                    selectedModeKey === route.activityType
                      ? 'border-2 border-[var(--color-accent)] ring-2 ring-[var(--color-accent-dim)]'
                      : isEcoWinner
                      ? 'border-2 border-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {isEcoWinner && (
                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow-sm font-outfit uppercase">
                        <FaLeaf /> MOST CARBON EFFICIENT
                      </span>
                    )}
                    {isShortest && (
                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-cyan-600 text-white flex items-center gap-1 shadow-sm font-outfit uppercase">
                        <FiCompass /> SHORTEST
                      </span>
                    )}
                    {isFastest && (
                      <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-amber-600 text-white flex items-center gap-1 shadow-sm font-outfit uppercase">
                        <FiZap /> FASTEST
                      </span>
                    )}
                  </div>

                  {/* Header & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                        {getModeIcon(route.activityType)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[var(--color-text-primary)] font-outfit leading-tight">
                          {route.modeTitle}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">
                          {route.distanceKm} km ({route.distanceMiles} miles)
                        </p>
                      </div>
                    </div>

                    {getEcoScoreBadge(route.ecoScore)}
                  </div>

                  {/* Carbon Footprint Intensity Meter */}
                  <div className="my-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold font-outfit">
                      <span className="text-[var(--color-text-muted)] text-[11px]">Emissions Intensity</span>
                      <span className={route.co2eKg === 0 ? 'text-[var(--color-accent)] font-extrabold' : 'text-[var(--color-text-primary)] font-extrabold'}>
                        {route.co2eKg} kg CO₂e ({intensityRatio}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-primary)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          route.co2eKg === 0 
                            ? 'bg-[var(--color-accent)]' 
                            : route.co2eKg < 0.8 
                            ? 'bg-cyan-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, intensityRatio)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-[var(--color-border)] my-2">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] block font-semibold uppercase tracking-wider font-outfit">EST. TRAVEL TIME</span>
                      <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1 mt-0.5">
                        <FiClock className="text-xs text-amber-500" /> {route.durationMinutes} minutes
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] block font-semibold uppercase tracking-wider font-outfit">CO₂E OUTPUT</span>
                      <span className={`text-xs font-extrabold mt-0.5 block ${
                        route.co2eKg === 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'
                      }`}>
                        {route.co2eKg} kg CO₂e
                      </span>
                    </div>
                  </div>

                  {/* Savings percentage */}
                  <div className="my-1.5">
                    {route.co2eSavingsVsBaselineKg > 0 ? (
                      <p className="text-xs text-[var(--color-accent)] flex items-center gap-1 font-bold font-outfit">
                        <FiTrendingDown className="text-sm" /> Saves {route.co2eSavingsVsBaselineKg} kg CO₂e ({route.savingsPercentage}% vs Petrol)
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">
                        Baseline emission benchmark
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={loggingMode === route.activityType}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogRouteActivity(route);
                    }}
                    className={`mt-3 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none font-outfit ${
                      isEcoWinner 
                        ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] text-white shadow-sm' 
                        : 'bg-[var(--color-bg-primary)] hover:bg-[var(--color-accent)] hover:text-white text-[var(--color-text-primary)] border border-[var(--color-border)]'
                    }`}
                  >
                    {loggingMode === route.activityType ? (
                      <span className="animate-pulse">Logging Activity to Profile...</span>
                    ) : (
                      <>
                        <FiCheckCircle className="text-sm" /> Log {route.modeTitle} Commute
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footprint Visualizer Chart */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-text-primary)] font-outfit flex items-center gap-2">
                  <FiAward className="text-[var(--color-accent)] text-lg" /> Emissions Footprint Comparison Chart (kg CO₂e)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium">
                  Lower bars indicate lower carbon emissions for the calculated route distance
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] inline-block"></span> Zero Carbon</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Low Carbon</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> High Carbon</span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.routes} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                  <XAxis 
                    dataKey="modeTitle" 
                    stroke="var(--color-text-muted)" 
                    fontSize={11} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis 
                    stroke="var(--color-text-muted)" 
                    fontSize={11} 
                    unit=" kg" 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                    }}
                    formatter={(value) => [`${value} kg CO₂e`, 'Emissions']}
                  />
                  <Bar dataKey="co2eKg" radius={[8, 8, 0, 0]}>
                    {result.routes.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.co2eKg === 0 
                            ? '#10b981' 
                            : entry.tags.includes('MOST_CARBON_EFFICIENT') 
                            ? '#06b6d4' 
                            : entry.co2eKg < 1.0 
                            ? '#3b82f6' 
                            : '#f59e0b'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
