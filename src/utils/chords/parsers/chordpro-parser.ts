import { parseChord } from '../chord';
import { parseKey } from '../notes';
import type { ChartDocument, Line, Section, SectionType, Segment } from '../types';

const INICIO_DE_SECAO: Record<string, SectionType> = {
  start_of_intro: 'intro',
  soi: 'intro',
  start_of_verse: 'verse',
  sov: 'verse',
  start_of_chorus: 'chorus',
  soc: 'chorus',
  start_of_bridge: 'bridge',
  sob: 'bridge',
  start_of_ending: 'ending',
};

const FIM_DE_SECAO = new Set([
  'end_of_intro',
  'eoi',
  'end_of_verse',
  'eov',
  'end_of_chorus',
  'eoc',
  'end_of_bridge',
  'eob',
  'end_of_ending',
]);

function parseLine(texto: string): Line {
  const segments: Segment[] = [];
  const padrao = /\[([^\]]+)\]/g;
  let ultimoIndice = 0;
  let casamento = padrao.exec(texto);

  if (casamento && casamento.index > 0) {
    segments.push({ chord: null, lyric: texto.slice(0, casamento.index) });
  }

  while (casamento) {
    const acorde = parseChord(casamento[1] as string);
    const inicioDaLetra = casamento.index + casamento[0].length;

    padrao.lastIndex = inicioDaLetra;
    const proximo = padrao.exec(texto);
    const fimDaLetra = proximo ? proximo.index : texto.length;

    segments.push({ chord: acorde, lyric: texto.slice(inicioDaLetra, fimDaLetra) });

    ultimoIndice = fimDaLetra;
    casamento = proximo;
  }

  if (segments.length === 0) {
    segments.push({ chord: null, lyric: texto });
  } else if (ultimoIndice < texto.length) {
    segments.push({ chord: null, lyric: texto.slice(ultimoIndice) });
  }

  return { segments };
}

export function parseChordPro(bruto: string): ChartDocument {
  const doc: ChartDocument = { title: null, artist: null, key: null, sections: [] };
  let atual: Section | null = null;

  for (const linhaBruta of bruto.split(/\r?\n/)) {
    const linha = linhaBruta.trimEnd();
    const diretiva = /^\s*\{([^:}]+)(?::\s*([^}]*))?\}\s*$/.exec(linha);

    if (diretiva) {
      const nome = (diretiva[1] ?? '').trim().toLowerCase();
      const valor = diretiva[2]?.trim() ?? null;
      const tipoDeSecao = nome === 'comment' || nome === 'c' ? 'other' : INICIO_DE_SECAO[nome];

      if (nome === 'title' || nome === 't') {
        doc.title = valor;
      } else if (nome === 'artist' || nome === 'subtitle' || nome === 'st') {
        doc.artist = valor;
      } else if (nome === 'key') {
        doc.key = valor === null ? null : parseKey(valor);
      } else if (tipoDeSecao !== undefined) {
        atual = { type: tipoDeSecao, label: valor, lines: [] };
        doc.sections.push(atual);
      } else if (FIM_DE_SECAO.has(nome)) {
        atual = null;
      }

      continue;
    }

    if (linha.trim().length === 0) {
      continue;
    }

    if (atual === null) {
      atual = { type: 'other', label: null, lines: [] };
      doc.sections.push(atual);
    }

    atual.lines.push(parseLine(linha));
  }

  return doc;
}

/** Só é ChordPro se tiver diretiva entre chaves ou acorde entre colchetes. */
export function looksLikeChordPro(bruto: string): boolean {
  return /\{[a-zA-Z_]+[:}]/.test(bruto) || /\[[A-G][^\]]{0,10}\]/.test(bruto);
}
