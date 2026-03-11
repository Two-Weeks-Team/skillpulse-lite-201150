"use client";
import { useEffect, useState } from "react";
import SkillSelectorModal from '@/components/SkillSelectorModal';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('skill_selected');
    if (!stored) setShowModal(true);
  }, []);

  return (
    <section className="text-center py-12 bg-primary text-card rounded-xl shadow-lg">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 font-dm">
        SkillPulse Lite
      </h1>
      <p className="text-lg md:text-xl mb-6">
        5‑minute micro‑lessons with instant, rule‑based feedback.
      </p>
      <button
        className="inline-flex items-center px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition"
        onClick={() => setShowModal(true)}
      >
        <AcademicCapIcon className="w-5 h-5 mr-2" />
        Choose Your Skill
      </button>
      {showModal && <SkillSelectorModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
