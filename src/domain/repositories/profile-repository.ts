import type { Profile } from '../entities/profile';

export interface ProfileRepository {
  getById(id: string): Promise<Profile>;
  updateOwn(id: string, patch: { name?: string; instrument?: string | null }): Promise<Profile>;
}
