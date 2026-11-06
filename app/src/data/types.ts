// Mesmo formato das coleções do banco "Compara Preços" (lojas, compras, produtos).

export type Unidade = 'UN' | 'KG' | 'L';

export interface Loja {
  id: string;
  nome: string;
  unidade?: string;
  endereco?: string;
  cnpj?: string;
  razaoSocial?: string;
}

export interface RegistroPreco {
  compraId: string | null;
  data: string; // ISO com fuso
  lojaId: string;
  item?: string;
  qtd: number;
  precoUnit: number;
  desconto: number;
  total: number; // já com desconto
  precoEfetivo: number; // total ÷ qtd
  origem?: 'manual';
}

export interface Produto {
  id: string;
  descricao: string;
  codigo: string | null;
  ean: string | null;
  codigoInterno: boolean;
  unidade: Unidade;
  registros: RegistroPreco[];
}

export interface ItemCompra {
  item: string;
  descricao: string;
  produtoId: string;
  qtd: number;
  unidade: Unidade;
  precoUnit: number;
  desconto: number;
  total: number;
}

export interface Compra {
  id: string;
  lojaId: string;
  data: string;
  chave: string;
  nfce: string;
  serie: string;
  coo?: string;
  operador?: string;
  totalItens: number;
  valorTotal: number;
  desconto: number;
  valorPago: number;
  pagamentos: { forma: string; valor: number }[];
  tributos?: { federal: number; estadual: number; municipal: number };
  observacao?: string;
  itens: ItemCompra[];
}
