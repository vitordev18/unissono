import { useEffect, useState } from 'react';

/** Evita uma consulta por tecla digitada na busca. */
export function useDebounce<T>(valor: T, atrasoMs = 300): T {
  const [adiado, setAdiado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setAdiado(valor);
    }, atrasoMs);

    return () => {
      clearTimeout(temporizador);
    };
  }, [valor, atrasoMs]);

  return adiado;
}
