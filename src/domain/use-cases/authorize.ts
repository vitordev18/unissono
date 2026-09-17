import type { Profile } from '../entities/profile';

/** Áreas do app com exigência de papel. A UI pergunta ao domínio, não decide. */
export type Area = 'publica' | 'membro' | 'lideranca';

export function canAccess(area: Area, profile: Profile | null): boolean {
  if (area === 'publica') {
    return true;
  }

  if (!profile?.isActive) {
    return false;
  }

  if (area === 'lideranca') {
    return profile.role === 'lider';
  }

  return true;
}
