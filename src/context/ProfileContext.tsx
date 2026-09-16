import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearProfile, loadProfile, saveProfile, type Profile } from '../engine/profile';

interface Ctx {
  profile: Profile;
  setProfile: (updater: (p: Profile) => Profile) => void;
  reset: () => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  setCompare: (ids: string[]) => void;
}

const ProfileCtx = createContext<Ctx | null>(null);
const CMP_KEY = 'radar-p2p:compare:v1';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setP] = useState<Profile>(() => loadProfile());
  const [compare, setCmp] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CMP_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => { saveProfile(profile); }, [profile]);
  useEffect(() => {
    try { localStorage.setItem(CMP_KEY, JSON.stringify(compare)); } catch { /* noop */ }
  }, [compare]);

  const setProfile = useCallback((updater: (p: Profile) => Profile) => setP((prev) => updater(prev)), []);
  const reset = useCallback(() => { clearProfile(); setP(loadProfile()); }, []);
  const toggleCompare = useCallback((id: string) => {
    setCmp((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]));
  }, []);
  const setCompare = useCallback((ids: string[]) => setCmp(ids.slice(0, 4)), []);

  const value = useMemo(() => ({ profile, setProfile, reset, compare, toggleCompare, setCompare }), [profile, setProfile, reset, compare, toggleCompare, setCompare]);
  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>;
}

export function useProfile(): Ctx {
  const c = useContext(ProfileCtx);
  if (!c) throw new Error('useProfile fuera del ProfileProvider');
  return c;
}
