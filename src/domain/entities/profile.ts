import { z } from 'zod';

export const roleSchema = z.enum(['lider', 'musico']);
export type Role = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(120),
  role: roleSchema,
  instrument: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
});

export type Profile = z.infer<typeof profileSchema>;

export function isLeader(profile: Profile): boolean {
  return profile.role === 'lider';
}

/** Rótulo do papel para exibição — o domínio decide, a UI só mostra. */
export function roleLabel(role: Role): string {
  return role === 'lider' ? 'Líder' : 'Músico';
}
