// Camada de dados do app. Hoje lê o seed exportado do banco "Compara Preços";
// quando o Supabase estiver configurado, troque a implementação abaixo pelas
// consultas às tabelas de supabase/schema.sql mantendo a mesma interface.
import seed from './seed.json';
import type { Compra, Loja, Produto } from './types';

export interface Repositorio {
  lojas(): Promise<Record<string, Loja>>;
  produtos(): Promise<Produto[]>;
  produto(id: string): Promise<Produto | undefined>;
  compras(): Promise<Compra[]>;
  compra(id: string): Promise<Compra | undefined>;
  compraPorChave(chave: string): Promise<Compra | undefined>;
}

const dados = seed as unknown as { lojas: Loja[]; compras: Compra[]; produtos: Produto[] };

export const repo: Repositorio = {
  async lojas() {
    return Object.fromEntries(dados.lojas.map((l) => [l.id, l]));
  },
  async produtos() {
    return dados.produtos;
  },
  async produto(id) {
    return dados.produtos.find((p) => p.id === id);
  },
  async compras() {
    return [...dados.compras].sort((a, b) => (a.data < b.data ? 1 : -1));
  },
  async compra(id) {
    return dados.compras.find((c) => c.id === id);
  },
  async compraPorChave(chave) {
    return dados.compras.find((c) => c.chave === chave);
  },
};
