"use client";
import { useEffect, useState } from "react";
import { fetchSkills, Skill } from '@/lib/api';
import clsx from 'clsx';

interface Props {
  onClose: () => void;
}

export default function SkillSelectorModal({ onClose }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectSkill = (id: number) => {
    localStorage.setItem('skill_selected', id.toString());
    onClose();
    // Force a reload to propagate selection; in a full app you'd use context.
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Select a Skill</h2>
        {loading && <p>Loading skills…</p>}
        {error && <p className="text-warning">{error}</p>}
        <div className="grid gap-4">
          {skills.map(skill => (
            <button
              key={skill.id}
              className={clsx(
                'flex items-center p-3 border rounded hover:shadow-md transition',
                'border-border bg-muted'
              )}
              onClick={() => selectSkill(skill.id)}
            >
              <img src={skill.icon} alt={skill.name} className="w-8 h-8 mr-3" />
              <div className="text-left">
                <p className="font-medium">{skill.name}</p>
                <p className="text-sm text-muted">{skill.description}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          className="mt-4 text-sm underline"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
