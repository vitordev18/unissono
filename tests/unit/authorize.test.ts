import type { Profile } from '@/domain/entities/profile';
import { canAccess } from '@/domain/use-cases/authorize';

const lider: Profile = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Líder',
  role: 'lider',
  instrument: null,
  avatarUrl: null,
  isActive: true,
};

const musico: Profile = { ...lider, id: '22222222-2222-4222-8222-222222222222', role: 'musico' };
const musicoInativo: Profile = { ...musico, isActive: false };
const liderInativo: Profile = { ...lider, isActive: false };

describe('canAccess', () => {
  it('libera a área pública até sem perfil', () => {
    expect(canAccess('publica', null)).toBe(true);
    expect(canAccess('publica', musicoInativo)).toBe(true);
  });

  it('exige membro ativo na área de membro', () => {
    expect(canAccess('membro', musico)).toBe(true);
    expect(canAccess('membro', lider)).toBe(true);
    expect(canAccess('membro', null)).toBe(false);
    expect(canAccess('membro', musicoInativo)).toBe(false);
  });

  it('restringe a área da liderança ao líder ativo', () => {
    expect(canAccess('lideranca', lider)).toBe(true);
    expect(canAccess('lideranca', musico)).toBe(false);
    expect(canAccess('lideranca', liderInativo)).toBe(false);
    expect(canAccess('lideranca', null)).toBe(false);
  });
});
