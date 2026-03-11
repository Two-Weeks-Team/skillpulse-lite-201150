"use client";
import { useEffect, useState } from "react";
import { fetchProgress, Progress } from '@/lib/api';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function CollectionPanel() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(setProgress)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading badges…</p>;

  if (!progress || !progress.badge_image) {
    return (
      <section className="bg-card rounded-lg shadow p-4 text-center text-muted">
        <p>No badges earned yet. Complete lessons to unlock them!</p>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold flex items-center mb-3">
        <PhotoIcon className="w-5 h-5 mr-2" />
        Your Badges
      </h3>
      <img src={progress.badge_image} alt="Earned badge" className="w-32 h-32 mx-auto" />
    </section>
  );
}
