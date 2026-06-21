import type { InterviewSessionRecord, PracticeSettings, InterviewPersona } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';

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
  
  if (isBrowser()) {
    syncSessionToCloud(session).catch(err => console.error('Failed to sync session to cloud:', err));
  }
}

export function loadPracticeSettings() {
  return readJson<PracticeSettings>(SETTINGS_KEY, defaultSettings);
}

export function savePracticeSettings(settings: PracticeSettings) {
  writeJson(SETTINGS_KEY, settings);
  window.dispatchEvent(new Event('ace-interview:settings-updated'));
  
  if (isBrowser()) {
    syncSettingsToCloud(settings).catch(err => console.error('Failed to sync settings to cloud:', err));
  }
}

export function createSessionId() {
  return generateUuid();
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

// --- Sync Utilities ---

export function generateUuid() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUuid(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export async function syncSessionToCloud(session: InterviewSessionRecord) {
  if (!isBrowser()) return;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let sessionUuid = session.id;
  let hasLocalIdChanged = false;

  if (!isValidUuid(sessionUuid)) {
    sessionUuid = generateUuid();
    session.id = sessionUuid;
    hasLocalIdChanged = true;
  }

  const { error: sessionError } = await supabase
    .from('sessions')
    .upsert({
      id: sessionUuid,
      user_id: user.id,
      role: session.role,
      company: session.company || null,
      persona: session.persona,
      topics: session.topics,
      recommended_practice: session.recommendedPractice || [],
      summary: session.summary || null,
      completed: session.completed,
      updated_at: new Date().toISOString()
    });

  if (sessionError) {
    const errMsg = typeof sessionError === 'string' ? sessionError : sessionError.message || '';
    const errCode = typeof sessionError === 'object' && sessionError !== null ? (sessionError as any).code : '';
    if (
      errCode === '42501' ||
      errMsg.toLowerCase().includes('row-level security') ||
      errMsg.toLowerCase().includes('row_level_security') ||
      errMsg.toLowerCase().includes('policy')
    ) {
      console.warn(`Session ${sessionUuid} belongs to another user. Skipping cloud sync for this session.`);
      return;
    }
    console.error('Failed to sync session metadata:', errMsg || sessionError);
    return;
  }

  if (session.answers && session.answers.length > 0) {
    const answersToUpsert = session.answers.map(ans => {
      if (!ans.id || !isValidUuid(ans.id)) {
        ans.id = generateUuid();
        hasLocalIdChanged = true;
      }
      return {
        id: ans.id,
        session_id: sessionUuid,
        question: ans.question,
        transcript: ans.answer,
        score: ans.score,
        feedback: {
          feedback: ans.feedback,
          weaknesses: ans.weaknesses || null,
          strengths: ans.strengths || null
        },
        created_at: ans.timestamp
      };
    });

    const { error: answersError } = await supabase
      .from('answers')
      .upsert(answersToUpsert);

    if (answersError) {
      const errMsg = typeof answersError === 'string' ? answersError : answersError.message || '';
      const errCode = typeof answersError === 'object' && answersError !== null ? (answersError as any).code : '';
      if (
        errCode === '42501' ||
        errMsg.toLowerCase().includes('row-level security') ||
        errMsg.toLowerCase().includes('row_level_security') ||
        errMsg.toLowerCase().includes('policy')
      ) {
        console.warn(`Answers for session ${sessionUuid} violate RLS. Skipping answers sync.`);
        return;
      }
      console.error('Failed to sync session answers:', errMsg || answersError);
    }
  }

  if (hasLocalIdChanged) {
    const localSessions = loadInterviewSessions();
    const nextSessions = localSessions.map(s => s.id === sessionUuid || s.id === session.id ? session : s);
    writeJson(SESSIONS_KEY, nextSessions);
  }
}

export async function syncSettingsToCloud(settings: PracticeSettings) {
  if (!isBrowser()) return;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      practice_settings: settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to sync settings to profile:', error.message || error);
  }
}

export async function syncCloudToLocal() {
  if (!isBrowser()) return;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Fetch remote profile/settings
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('practice_settings')
    .eq('id', user.id)
    .single();

  if (profileError) {
    // Attempt to create the profile row (for existing users who pre-dated the trigger)
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: user.id })
      .select('practice_settings')
      .single();

    if (!insertError) {
      profile = newProfile;
      profileError = null;
    }
  }

  if (!profileError && profile?.practice_settings) {
    writeJson(SETTINGS_KEY, profile.practice_settings);
    window.dispatchEvent(new Event('ace-interview:settings-updated'));
  }

  // 2. Fetch remote sessions
  const { data: remoteSessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(`
      *,
      answers (*)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (sessionsError) {
    console.error('Failed to fetch remote sessions:', sessionsError.message || sessionsError);
    return;
  }

  // 3. Merge
  const localSessions = loadInterviewSessions();
  const merged: InterviewSessionRecord[] = [...localSessions];

  remoteSessions?.forEach((remote) => {
    const mappedAnswers = (remote.answers || []).map((ans: any) => ({
      id: ans.id,
      question: ans.question,
      answer: ans.transcript || '',
      score: ans.score || 0,
      feedback: typeof ans.feedback === 'object' && ans.feedback !== null ? (ans.feedback.feedback || '') : (ans.feedback || ''),
      weaknesses: typeof ans.feedback === 'object' && ans.feedback !== null ? (ans.feedback.weaknesses || undefined) : undefined,
      strengths: typeof ans.feedback === 'object' && ans.feedback !== null ? (ans.feedback.strengths || undefined) : undefined,
      timestamp: ans.created_at
    }));

    const remoteSessionRecord: InterviewSessionRecord = {
      id: remote.id,
      createdAt: remote.created_at,
      updatedAt: remote.updated_at,
      role: remote.role,
      company: remote.company || undefined,
      persona: remote.persona as InterviewPersona,
      topics: remote.topics || {},
      questionCount: remote.topics ? Object.keys(remote.topics).length : 0,
      completed: remote.completed,
      answers: mappedAnswers,
      bookmarkedQuestions: [],
      summary: remote.summary || undefined,
      recommendedPractice: remote.recommended_practice || []
    };

    const existingIndex = merged.findIndex(s => s.id === remote.id);
    if (existingIndex > -1) {
      const local = merged[existingIndex];
      const localTime = new Date(local.updatedAt).getTime();
      const remoteTime = new Date(remote.updated_at).getTime();
      if (remoteTime > localTime) {
        merged[existingIndex] = remoteSessionRecord;
      }
    } else {
      merged.push(remoteSessionRecord);
    }
  });

  writeJson(SESSIONS_KEY, merged);
  window.dispatchEvent(new Event('ace-interview:sessions-updated'));

  // 4. Push local-only sessions to remote
  const localOnly = localSessions.filter(local => 
    !remoteSessions?.some(remote => remote.id === local.id)
  );

  for (const localSession of localOnly) {
    await syncSessionToCloud(localSession);
  }
}
