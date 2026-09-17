import { formatKey } from '@/utils/chords/notes';
import { isChordLine } from '@/utils/chords/parsers/chords-over-lyrics-parser';
import { detectFormat, parseChart } from '@/utils/chords/parsers/registry';
import { toChordPro } from '@/utils/chords/serialize';

import { exigirTom } from '../../support/chords';

describe('detectFormat', () => {
  it('reconhece ChordPro por diretiva ou acorde entre colchetes', () => {
    expect(detectFormat('{title: Exemplo}\n[C]Letra')).toBe('chordpro');
    expect(detectFormat('[G]Só o acorde entre colchetes')).toBe('chordpro');
  });

  it('cai para acordes sobre a letra no texto colado comum', () => {
    expect(detectFormat('G          D\nMinha letra aqui')).toBe('acordes-sobre-letra');
  });
});

describe('parseChordPro', () => {
  const doc = parseChart(`{title: Exemplo}
{artist: Ministério}
{key: G}
{start_of_verse: Verso 1}
[G]Primeira [D]linha
{end_of_verse}
{start_of_chorus}
[Em]Refrão [C]aqui
{end_of_chorus}`);

  it('lê metadados', () => {
    expect(doc.title).toBe('Exemplo');
    expect(doc.artist).toBe('Ministério');
    expect(formatKey(exigirTom(doc.key))).toBe('G');
  });

  it('separa as seções com tipo e rótulo', () => {
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[0]).toMatchObject({ type: 'verse', label: 'Verso 1' });
    expect(doc.sections[1]).toMatchObject({ type: 'chorus', label: null });
  });

  it('associa cada acorde ao trecho de letra que ele acompanha', () => {
    expect(doc.sections[0]?.lines[0]?.segments).toEqual([
      { chord: { root: 7, suffix: '', bass: null }, lyric: 'Primeira ' },
      { chord: { root: 2, suffix: '', bass: null }, lyric: 'linha' },
    ]);
  });

  it('mantém letra antes do primeiro acorde', () => {
    const comPrefixo = parseChart('Antes [C]depois');

    expect(comPrefixo.sections[0]?.lines[0]?.segments[0]).toEqual({
      chord: null,
      lyric: 'Antes ',
    });
  });
});

describe('isChordLine', () => {
  it('aceita linha só de acordes', () => {
    expect(isChordLine('G          D/F#      Em7')).toBe(true);
    expect(isChordLine('  Bb  ')).toBe(true);
  });

  it('não confunde palavras da letra com acordes', () => {
    expect(isChordLine('E')).toBe(false); // conjunção, não o acorde de mi
    expect(isChordLine('A')).toBe(false); // artigo
    expect(isChordLine('Eu te louvarei')).toBe(false);
    expect(isChordLine('Deus e Senhor')).toBe(false);
  });
});

describe('parseChordsOverLyrics', () => {
  const doc = parseChart(`Tom: G

[Intro]
G  D/F#  Em7

Verso 1:
G                D
Primeira linha da letra
Em               C
Segunda linha da letra`);

  it('lê o tom declarado no topo', () => {
    expect(formatKey(exigirTom(doc.key))).toBe('G');
  });

  it('separa seções pelos rótulos usuais', () => {
    expect(doc.sections.map((section) => section.type)).toEqual(['intro', 'verse']);
    expect(doc.sections[1]?.label).toBe('Verso 1');
  });

  it('alinha cada acorde à coluna em que aparece sobre a letra', () => {
    const primeira = doc.sections[1]?.lines[0];

    expect(primeira?.segments).toEqual([
      { chord: { root: 7, suffix: '', bass: null }, lyric: 'Primeira linha da' },
      { chord: { root: 2, suffix: '', bass: null }, lyric: ' letra' },
    ]);
  });

  it('trata linha de acordes sem letra como trecho instrumental', () => {
    const intro = doc.sections[0]?.lines[0];

    expect(intro?.segments).toHaveLength(3);
    expect(intro?.segments.every((segment) => segment.lyric === '')).toBe(true);
  });

  it('deduz o tom pelo primeiro acorde quando não há "Tom:"', () => {
    const semTom = parseChart('Am\nPrimeira linha');

    expect(formatKey(exigirTom(semTom.key))).toBe('Am');
  });
});

describe('toChordPro', () => {
  it('fecha o ciclo: texto colado vira ChordPro relido igual', () => {
    const colado = `Verso 1:
G                D
Primeira linha da letra`;
    const doc = parseChart(colado);
    const chordpro = toChordPro(doc);
    const relido = parseChart(chordpro);

    expect(detectFormat(chordpro)).toBe('chordpro');
    expect(toChordPro(relido)).toBe(chordpro);
  });
});
