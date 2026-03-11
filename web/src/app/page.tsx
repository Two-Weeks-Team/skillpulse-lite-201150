"use client";
import { useEffect, useState } from "react";
import Hero from '@/components/Hero';
import DashboardPage from '@/components/DashboardPage';
import InsightPanel from '@/components/InsightPanel';
import CollectionPanel from '@/components/CollectionPanel';
import StatsStrip from '@/components/StatsStrip';

export default function HomePage() {
  // Simple global flags for demo – in a real app you might use a context provider.
  const [hasSeenSkillModal, setHasSeenSkillModal] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('skill_selected');
    if (!seen) setHasSeenSkillModal(true);
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-4 md:p-8 space-y-8">
      <Hero />
      <StatsStrip />
      <DashboardPage onCloseSkillModal={() => setHasSeenSkillModal(false)} />
      <InsightPanel />
      <CollectionPanel />
    </main>
  );
}
