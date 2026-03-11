"use client";
import { useState } from "react";
import { Lesson, submitLesson, generateCertificate } from '@/lib/api';
import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface Props {
  lesson: Lesson;
  onClose: () => void;
}

export default function LessonCard({ lesson, onClose }: Props) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitLesson(lesson.lesson_id, answer);
      setFeedback(res.feedback);
      setCorrect(res.status === 'ok');
      if (res.badge_awarded) {
        const cert = await generateCertificate(res.current_streak, parseInt(localStorage.getItem('skill_selected') || '0'));
        setBadgeUrl(cert.certificate_url);
      }
    } catch (e: any) {
      setFeedback(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 relative">
        <button
          className="absolute top-2 right-2 text-muted hover:text-foreground"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-xl font-bold">{lesson.title}</h3>
        <p className="text-muted">{lesson.exercise_prompt}</p>
        <textarea
          rows={4}
          className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type your answer here…"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={submitting || correct}
        />
        {feedback && (
          <div className={clsx('p-2 rounded', correct ? 'bg-success text-white' : 'bg-warning text-white')}>
            {correct ? <CheckCircleIcon className="w-5 h-5 inline mr-1" /> : <XCircleIcon className="w-5 h-5 inline mr-1" />}
            {feedback}
          </div>
        )}
        <div className="flex justify-between items-center">
          <button
            className={clsx('px-4 py-2 rounded text-white', correct ? 'bg-muted cursor-not-allowed' : 'bg-primary hover:bg-primary/90')}
            onClick={handleSubmit}
            disabled={submitting || correct}
          >
            {submitting ? 'Submitting…' : correct ? 'Completed' : 'Submit'}
          </button>
          {badgeUrl && (
            <a
              href={badgeUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center space-x-1 text-accent hover:underline"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Badge</span>
            </a>
          )}
        </div>
        {correct && (
          <div className="confetti absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl animate-bounce">🎉</span>
          </div>
        )}
      </div>
    </div>
  );
}
