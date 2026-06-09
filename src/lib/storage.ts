import type { InterviewSessionRecord, PracticeSettings } from '@/lib/types';

const SESSIONS_KEY = 'ace-interview.sessions';
const SETTINGS_KEY = 'ace-interview.settings';

const defaultSettings: PracticeSettings = {
  voiceLanguage: 'en-US',
  defaultDifficulty: 'Medium',
  preferredPersona: 'friendly',
  responseMode: 'mixed',
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadInterviewSessions() {
  return readJson<InterviewSessionRecord[]>(SESSIONS_KEY, []);
}

export function saveInterviewSessions(sessions: InterviewSessionRecord[]) {
  writeJson(SESSIONS_KEY, sessions);
  window.dispatchEvent(new Event('ace-interview:sessions-updated'));
}

export function upsertInterviewSession(session: InterviewSessionRecord) {
  const sessions = loadInterviewSessions();
  const next = sessions.some((item) => item.id === session.id)
    ? sessions.map((item) => (item.id === session.id ? session : item))
    : [session, ...sessions];
  saveInterviewSessions(next);
}

export function loadPracticeSettings() {
  return readJson<PracticeSettings>(SETTINGS_KEY, defaultSettings);
}

export function savePracticeSettings(settings: PracticeSettings) {
  writeJson(SETTINGS_KEY, settings);
  window.dispatchEvent(new Event('ace-interview:settings-updated'));
}

export function createSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function getWeakTopicWeights() {
  const sessions = loadInterviewSessions();
  const weights = new Map<string, number>();
  sessions.forEach((session) => {
    session.recommendedPractice?.forEach((topic) => {
      weights.set(topic, (weights.get(topic) || 0) + 1);
    });
    session.answers.forEach((answer) => {
      const score = answer.score;
      const bucket = score < 50 ? 3 : score < 75 ? 2 : 1;
      const topicKey = answer.question.toLowerCase();
      weights.set(topicKey, (weights.get(topicKey) || 0) + bucket);
    });
  });
  return Array.from(weights.entries()).sort((a, b) => b[1] - a[1]);
}

export function getAdaptiveTopicHints(topics: Record<string, string>) {
  const weak = getWeakTopicWeights();
  const keys = Object.keys(topics);
  if (weak.length === 0 || keys.length === 0) return keys;
  const ranked = [...keys].sort((a, b) => {
    const aHit = weak.find(([topic]) => a.toLowerCase().includes(topic.toLowerCase()))?.[1] || 0;
    const bHit = weak.find(([topic]) => b.toLowerCase().includes(topic.toLowerCase()))?.[1] || 0;
    return bHit - aHit;
  });
  return ranked;
}
