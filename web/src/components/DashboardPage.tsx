"use client";
import { useEffect, useState } from "react";
import { fetchTodayLesson, Lesson, submitLesson } from '@/lib/api';
import LessonCard from '@/components/LessonCard';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Props {
  onCloseSkillModal: () => void;
}

export default function DashboardPage({ onCloseSkillModal }: Props) {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('skill_selected') : null;
  const skillId = stored ? parseInt(stored) : null;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLesson, setShowLesson] = useState(false);

  useEffect(() => {
    if (!skillId) return;
    setLoading(true);
    fetchTodayLesson(skillId)
      .then(setLesson)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [skillId]);

  if (!skillId) {
    return (
      <section className="text-center py-12">
        <p className="text-muted mb-4">Select a skill to start your first lesson.</p>
        <button
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
          onClick={onCloseSkillModal}
        >
          Choose Skill
        </button>
      </section>
    );
  }

  if (loading) return <p className="text-center">Loading today’s lesson…</p>;
  if (error) return <p className="text-center text-warning">{error}</p>;
  if (!lesson) return <p className="text-center text-muted">No lesson available.</p>;

  return (
    <section className="bg-card rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Today’s Lesson</h2>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-accent" />
          <span className="font-medium">Streak: {localStorage.getItem('streak') || 0}</span>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
        <p className="text-muted mb-2 line-clamp-3">{lesson.content_text}</p>
        {lesson.content_image && (
          <img src={lesson.content_image} alt={lesson.title} className="w-full h-48 object-cover rounded" />
        )}
      </div>
      <button
        className="px-5 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        onClick={() => setShowLesson(true)}
      >
        Start Lesson
      </button>
      {showLesson && (
        <LessonCard lesson={lesson} onClose={() => setShowLesson(false)} />
      )}
    </section>
  );
}
