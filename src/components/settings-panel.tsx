'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadPracticeSettings, savePracticeSettings } from '@/lib/storage';
import type { InterviewPersona, PracticeSettings } from '@/lib/types';
import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';

const personas: InterviewPersona[] = ['friendly', 'strict', 'faang', 'rapid-fire'];
const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'cmn-CN'];

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<PracticeSettings>(loadPracticeSettings());
  const [apiKey, setApiKey] = useState('');
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const refresh = () => setSettings(loadPracticeSettings());
    const handleOpenSettings = () => setOpen(true);
    window.addEventListener('ace-interview:settings-updated', refresh as EventListener);
    window.addEventListener('ace-interview:open-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('ace-interview:settings-updated', refresh as EventListener);
      window.removeEventListener('ace-interview:open-settings', handleOpenSettings);
    };
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tokens_remaining, custom_api_key')
          .eq('id', user.id)
          .single();

        if (profile) {
          setTokens(profile.tokens_remaining);
          setApiKey(profile.custom_api_key || '');
        }
      }
    }
    if (open) {
      loadProfile();
    }
  }, [open, supabase]);

  const handleSave = async () => {
    setLoading(true);
    try {
      savePracticeSettings(settings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ custom_api_key: apiKey.trim() || null })
          .eq('id', user.id);

        if (error) throw error;
      }
      setOpen(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 bg-white/5 text-white">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Practice settings</DialogTitle>
          <DialogDescription className="text-white/60">
            These defaults are stored locally and reused across interview sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Voice language</label>
            <Select value={settings.voiceLanguage} onValueChange={(value) => setSettings((prev) => ({ ...prev, voiceLanguage: value }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {languages.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Default difficulty</label>
            <Select value={settings.defaultDifficulty} onValueChange={(value) => setSettings((prev) => ({ ...prev, defaultDifficulty: value as PracticeSettings['defaultDifficulty'] }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Easy', 'Medium', 'Hard'].map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Default persona</label>
            <Select value={settings.preferredPersona} onValueChange={(value) => setSettings((prev) => ({ ...prev, preferredPersona: value as InterviewPersona }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {personas.map((persona) => <SelectItem key={persona} value={persona}>{persona}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Response mode</label>
            <Select value={settings.responseMode} onValueChange={(value) => setSettings((prev) => ({ ...prev, responseMode: value as PracticeSettings['responseMode'] }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['typed', 'spoken', 'mixed'].map((mode) => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom API Key Integration */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Quota Usage</span>
              <span className="font-semibold text-[#E1E0CC]">
                {tokens !== null ? `${tokens} tokens remaining` : 'Loading...'}
              </span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/70 flex justify-between items-center">
                <span>Groq API Key <span className="text-xs text-white/35">(Optional & Secure)</span></span>
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-[#E1E0CC] hover:underline">
                  (get api key)
                </a>
              </label>
              <Input
                type="password"
                placeholder={apiKey ? '••••••••••••••••••••' : 'gsk_...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/5 border-white/10 text-white rounded-xl placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-[#E1E0CC]"
              />
              <p className="text-[10px] text-white/40 leading-normal">
                Bypasses default quota limits. Stored securely in your private cloud profile and sent directly to the AI engine.
              </p>
            </div>
          </div>

          <Button className="w-full" disabled={loading} onClick={handleSave}>
            {loading ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
