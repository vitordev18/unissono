import { parseChord } from '../chord';
import { parseKey } from '../notes';
import type { ChartDocument, Line, Section, SectionType, Segment } from '../types';

const ROTULOS: { padrao: RegExp; tipo: SectionType }[] = [
  { padrao: /^intro/i, tipo: 'intro' },
  { padrao: /^(refr[ãa]o|chorus)/i, tipo: 'chorus' },
  { padrao: /^(ponte|bridge)/i, tipo: 'bridge' },
  { padrao: /^(final|ending|outro)/i, tipo: 'ending' },
  { padrao: /^(verso|estrofe|verse)/i, tipo: 'verse' },
];

interface Rotulo {
  tipo: SectionType;
  label: string;
}

/** "[Refrão]", "Refrão:", "Intro:" — como as cifras da internet costumam marcar. */
function lerRotuloDeSecao(linha: string): Rotulo | null {
  const entreColchetes = /^\[([^\]]{1,40})\]$/.exec(linha.trim());
  const comDoisPontos = /^([\p{L}\p{N} º°ªº'-]{1,40}):$/u.exec(linha.trim());
  const texto = entreColchetes?.[1] ?? comDoisPontos?.[1];

  if (texto === undefined) {
    return null;
  }

  const rotulo = texto.trim();

  if (parseChord(rotulo) !== null) {
    return null;
  }

  const conhecido = ROTULOS.find((item) => item.padrao.test(rotulo));

  return { tipo: conhecido?.tipo ?? 'other', label: rotulo };
}

interface TokenDeAcorde {
  texto: string;
  coluna: number;
}

function lerTokens(linha: string): TokenDeAcorde[] {
  const tokens: TokenDeAcorde[] = [];
  const padrao = /\S+/g;
  let casamento = padrao.exec(linha);

  while (casamento) {
    tokens.push({ texto: casamento[0], coluna: casamento.index });
    casamento = padrao.exec(linha);
  }

  return tokens;
}

/**
 * Decide se a linha é de acordes.
 *
 * O risco em português é confundir letra com cifra: "A", "E" e "Da" são
 * palavras e também acordes válidos. Por isso uma linha de um único token só
 * conta como acorde se tiver sufixo ou acidente (A7, Bb, F#m) — "E" sozinho
 * continua sendo a conjunção.
 */
export function isChordLine(linha: string): boolean {
  const tokens = lerTokens(linha);

  if (tokens.length === 0) {
    return false;
  }

  if (!tokens.every((token) => parseChord(token.texto) !== null)) {
    return false;
  }

  if (tokens.length === 1) {
    return (tokens[0] as TokenDeAcorde).texto.length > 1;
  }

  return true;
}

function montarLinha(linhaDeAcordes: string, letra: string): Line {
  const tokens = lerTokens(linhaDeAcordes);
  const segments: Segment[] = [];
  const primeiraColuna = tokens[0]?.coluna ?? 0;

  if (primeiraColuna > 0 && letra.length > 0) {
    segments.push({ chord: null, lyric: letra.slice(0, primeiraColuna) });
  }

  tokens.forEach((token, indice) => {
    const proximo = tokens[indice + 1];
    const fim = proximo ? proximo.coluna : Math.max(letra.length, token.coluna);

    segments.push({
      chord: parseChord(token.texto),
      lyric: token.coluna >= letra.length ? '' : letra.slice(token.coluna, fim),
    });
  });

  return { segments };
}

export function parseChordsOverLyrics(bruto: string): ChartDocument {
  const doc: ChartDocument = { title: null, artist: null, key: null, sections: [] };
  const linhas = bruto.split(/\r?\n/);
  let atual: Section | null = null;

  const garantirSecao = (): Section => {
    if (atual === null) {
      const nova: Section = { type: 'other', label: null, lines: [] };

      doc.sections.push(nova);

      return nova;
    }

    return atual;
  };

  for (let i = 0; i < linhas.length; i += 1) {
    const linha = (linhas[i] as string).trimEnd();

    if (linha.trim().length === 0) {
      continue;
    }

    const tomDeclarado = /^tom:\s*(\S+)/i.exec(linha.trim());

    if (tomDeclarado) {
      doc.key = parseKey(tomDeclarado[1] as string);
      continue;
    }

    const rotulo = lerRotuloDeSecao(linha);

    if (rotulo) {
      atual = { type: rotulo.tipo, label: rotulo.label, lines: [] };
      doc.sections.push(atual);
      continue;
    }

    const secao = garantirSecao();

    atual = secao;

    if (isChordLine(linha)) {
      const proxima = linhas[i + 1];
      const letra = proxima !== undefined && !isChordLine(proxima) ? proxima.trimEnd() : '';

      secao.lines.push(montarLinha(linha, letra));

      if (letra.length > 0) {
        i += 1;
      }

      continue;
    }

    secao.lines.push({ segments: [{ chord: null, lyric: linha }] });
  }

  if (doc.key === null) {
    const primeiroAcorde = doc.sections
      .flatMap((section) => section.lines)
      .flatMap((line) => line.segments)
      .find((segment) => segment.chord !== null)?.chord;

    if (primeiroAcorde) {
      doc.key = { root: primeiroAcorde.root, minor: /^m(?!aj)/.test(primeiroAcorde.suffix) };
    }
  }

  return doc;
}
