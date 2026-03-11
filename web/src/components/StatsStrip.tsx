"use client";
import { useEffect, useState } from "react";
import { fetchProgress } from '@/lib/api';

export default function StatsStrip() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchProgress()
      .then(p => setStreak(p.current_streak))
      .catch(() => {});
  }, []);

  return (
    <div className="flex justify-center space-x-6 py-2 bg-muted rounded">
      <div className="flex items-center space-x-1">
        <span className="font-medium">🔥 Streak:</span>
        <span className="text-primary font-bold">{streak} days</span>
      </div>
    </div>
  );
}
