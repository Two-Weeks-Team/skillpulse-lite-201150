export interface Skill {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface Lesson {
  lesson_id: number;
  title: string;
  content_text: string;
  content_image?: string;
  exercise_prompt: string;
  hint: string;
  due_date: string;
}

export interface SubmitResponse {
  status: string;
  feedback: string;
  badge_awarded: boolean;
  current_streak: number;
  next_reward_in: number;
}

export interface Progress {
  current_streak: number;
  total_lessons_completed: number;
  badge_image: string;
  heatmap: { date: string; completed: boolean }[];
}

export interface CertificateResponse {
  certificate_url: string;
  download_url: string;
  share_links: { linkedin: string; pdf: string };
}

const API_BASE = '/api';

export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE}/skills`);
  if (!res.ok) throw new Error('Failed to fetch skills');
  const data = await res.json();
  return data.skills;
}

export async function fetchTodayLesson(skillId: number): Promise<Lesson> {
  const res = await fetch(`${API_BASE}/lesson/today?skill_id=${skillId}`);
  if (!res.ok) throw new Error('Failed to fetch today\'s lesson');
  return await res.json();
}

export async function submitLesson(lessonId: number, answer: string): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/lesson/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lesson_id: lessonId, answer })
  });
  if (!res.ok) throw new Error('Submission failed');
  return await res.json();
}

export async function fetchProgress(): Promise<Progress> {
  const res = await fetch(`${API_BASE}/progress`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return await res.json();
}

export async function generateCertificate(streak: number, skillId: number): Promise<CertificateResponse> {
  const res = await fetch(`${API_BASE}/certificate/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ streak, skill_id: skillId })
  });
  if (!res.ok) throw new Error('Certificate generation failed');
  return await res.json();
}
