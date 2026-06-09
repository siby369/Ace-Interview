'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadPracticeSettings, savePracticeSettings } from '@/lib/storage';
import type { InterviewPersona, PracticeSettings } from '@/lib/types';
import { Settings } from 'lucide-react';

const personas: InterviewPersona[] = ['friendly', 'strict', 'faang', 'rapid-fire'];
const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'cmn-CN'];

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<PracticeSettings>(loadPracticeSettings());

  useEffect(() => {
    const refresh = () => setSettings(loadPracticeSettings());
    window.addEventListener('ace-interview:settings-updated', refresh as EventListener);
    return () => window.removeEventListener('ace-interview:settings-updated', refresh as EventListener);
  }, []);

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
          <Button className="w-full" onClick={() => { savePracticeSettings(settings); setOpen(false); }}>
            Save settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
