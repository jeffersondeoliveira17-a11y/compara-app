import { useEffect, useState } from 'react';
import { repo } from './repo';
import type { Compra, Loja, Produto } from './types';

export interface Dados {
  carregando: boolean;
  lojas: Record<string, Loja>;
  produtos: Produto[];
  compras: Compra[];
}

/** Carrega lojas, produtos e compras uma vez por tela. */
export function useDados(): Dados {
  const [estado, setEstado] = useState<Dados>({ carregando: true, lojas: {}, produtos: [], compras: [] });
  useEffect(() => {
    let vivo = true;
    Promise.all([repo.lojas(), repo.produtos(), repo.compras()]).then(([lojas, produtos, compras]) => {
      if (vivo) setEstado({ carregando: false, lojas, produtos, compras });
    });
    return () => {
      vivo = false;
    };
  }, []);
  return estado;
}
