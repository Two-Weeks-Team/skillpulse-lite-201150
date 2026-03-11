"use client";
import { useEffect, useState } from "react";
import { fetchProgress, Progress } from '@/lib/api';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function InsightPanel() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress()
      .then(setProgress)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading progress…</p>;
  if (error) return <p className="text-center text-warning">{error}</p>;
  if (!progress) return null;

  return (
    <section className="bg-card rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold flex items-center mb-3">
        <ChartBarIcon className="w-5 h-5 mr-2" />
        Your Progress
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 bg-muted rounded">
          <p className="text-sm text-muted">Streak</p>
          <p className="text-2xl font-bold">{progress.current_streak} days</p>
        </div>
        <div className="p-2 bg-muted rounded">
          <p className="text-sm text-muted">Completed</p>
          <p className="text-2xl font-bold">{progress.total_lessons_completed}</p>
        </div>
      </div>
    </section>
  );
}
