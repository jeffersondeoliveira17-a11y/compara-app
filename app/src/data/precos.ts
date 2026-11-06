import type { Loja, Produto, RegistroPreco } from './types';

export const brl = (v: number) => {
  const [int, dec] = Math.abs(v).toFixed(2).split('.');
  return (v < 0 ? '− ' : '') + 'R$ ' + int.replace(/\B(?=(\d{3})+$)/g, '.') + ',' + dec;
};

export const pct = (v: number) => (v > 0 ? '+' : '') + (v * 100).toFixed(1).replace('.', ',') + '%';

export const dataCurta = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const dataLonga = (iso: string) => {
  const d = new Date(iso);
  return `${dataCurta(iso)}/${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const sufixoUnidade = (p: Pick<Produto, 'unidade'>) => (p.unidade === 'KG' ? '/kg' : p.unidade === 'L' ? '/L' : '');

export const ordenarPorData = (r: RegistroPreco[]) => [...r].sort((a, b) => (a.data < b.data ? -1 : 1));

export interface PrecoPorLoja {
  lojaId: string;
  nome: string;
  ultimo: RegistroPreco;
}

/** Último preço efetivo de cada loja, do mais barato ao mais caro. */
export function precosPorLoja(p: Produto, lojas: Record<string, Loja>): PrecoPorLoja[] {
  const ultimo = new Map<string, RegistroPreco>();
  for (const r of ordenarPorData(p.registros)) ultimo.set(r.lojaId, r);
  return [...ultimo.entries()]
    .map(([lojaId, r]) => ({ lojaId, nome: lojas[lojaId]?.nome ?? lojaId, ultimo: r }))
    .sort((a, b) => a.ultimo.precoEfetivo - b.ultimo.precoEfetivo);
}

export interface ResumoProduto {
  produto: Produto;
  ultimo: RegistroPreco;
  /** Melhor preço em outra loja, quando existe. */
  outraLoja?: PrecoPorLoja;
  /** Variação do último preço pago em relação ao da outra loja. */
  diferenca?: number;
}

/** "Últimos preços pagos": produtos com comparação primeiro, depois os mais recentes. */
export function ultimosPrecos(produtos: Produto[], lojas: Record<string, Loja>): ResumoProduto[] {
  return produtos
    .filter((p) => p.registros.length > 0)
    .map((produto) => {
      const regs = ordenarPorData(produto.registros);
      const ultimo = regs[regs.length - 1];
      const outra = precosPorLoja(produto, lojas).find((x) => x.lojaId !== ultimo.lojaId);
      return {
        produto,
        ultimo,
        outraLoja: outra,
        diferenca: outra ? (ultimo.precoEfetivo - outra.ultimo.precoEfetivo) / outra.ultimo.precoEfetivo : undefined,
      };
    })
    .sort((a, b) => {
      if (!!a.outraLoja !== !!b.outraLoja) return a.outraLoja ? -1 : 1;
      if (a.ultimo.data !== b.ultimo.data) return a.ultimo.data < b.ultimo.data ? 1 : -1;
      return a.produto.descricao.localeCompare(b.produto.descricao, 'pt');
    });
}

/** Busca por nome ou código, sem acento e sem diferenciar maiúsculas. */
export function filtrar(produtos: Produto[], termo: string): Produto[] {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const t = norm(termo.trim());
  if (!t) return produtos;
  const partes = t.split(/\s+/);
  return produtos.filter((p) => {
    const alvo = norm(p.descricao) + ' ' + (p.codigo ?? '');
    return partes.every((x) => alvo.includes(x));
  });
}
