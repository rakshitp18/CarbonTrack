import { badges } from "../data/badges";
import BadgeCard from "../components/BadgeCard";
import { RiMedalLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function Badges() {
    const [earnedBadges, setEarnedBadges] = useState([]);

    useEffect(() => {
      const loadBadges = async () => {
        try {
          const { data } = await api.get("/users/me");
          setEarnedBadges(data.badges || []);
        } catch (err) {
          console.error("Failed to load badges", err);
        }
      };

      loadBadges();
    }, []);
  return (
    <div className="w-full space-y-8 fade-in flex-1 flex flex-col">

      {/* Page Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <RiMedalLine className="text-3xl text-[var(--color-accent)]" />
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              Sustainability Badges
            </h1>

            <p className="text-[var(--color-text-secondary)] mt-2">
              Collect achievements by reducing your carbon footprint,
              completing goals and maintaining sustainable habits.
            </p>
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1">
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={{
              ...badge,
              unlocked: earnedBadges.includes(badge.title),
            }}
          />
        ))}
      </div>

    </div>
  );
}