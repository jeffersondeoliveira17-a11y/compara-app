-- Compara · esquema do banco (PostgreSQL / Supabase)
-- Espelha as coleções do protótipo (lojas, produtos, compras) em tabelas relacionais.
-- Os registros de preço, que no protótipo ficam dentro de cada produto, viram a tabela "precos".

create table if not exists lojas (
  id            text primary key,              -- ex.: 'assai-barueri-0337'
  nome          text not null,                 -- 'Assaí Atacadista'
  unidade       text,                          -- 'Barueri (loja 0337)'
  endereco      text,
  cnpj          text unique,
  razao_social  text,
  criado_em     timestamptz not null default now()
);

create table if not exists produtos (
  id              text primary key,            -- EAN, ou '<rede>-<código interno>' para itens pesados
  descricao       text not null,
  codigo          text,
  ean             text unique,
  codigo_interno  boolean not null default false,
  unidade         text not null default 'UN' check (unidade in ('UN', 'KG', 'L')),
  criado_em       timestamptz not null default now()
);

create table if not exists compras (
  id            text primary key,              -- 'nfce-<número>-s<série>'
  usuario_id    uuid references auth.users (id) on delete cascade,
  loja_id       text not null references lojas (id),
  data          timestamptz not null,
  chave         char(44) not null unique,      -- chave de acesso da NFC-e
  nfce          text not null,
  serie         text not null,
  coo           text,
  operador      text,
  total_itens   numeric(10, 3) not null,
  valor_total   numeric(10, 2) not null,
  desconto      numeric(10, 2) not null default 0,
  valor_pago    numeric(10, 2) not null,
  pagamentos    jsonb not null default '[]',   -- [{forma, valor}]
  tributos      jsonb,                         -- {federal, estadual, municipal}
  observacao    text,
  criado_em     timestamptz not null default now()
);

create table if not exists itens_compra (
  compra_id   text not null references compras (id) on delete cascade,
  item        text not null,                   -- número do item na nota ('001')
  produto_id  text not null references produtos (id),
  descricao   text not null,                   -- descrição como saiu na nota
  qtd         numeric(10, 3) not null,
  unidade     text not null check (unidade in ('UN', 'KG', 'L')),
  preco_unit  numeric(10, 2) not null,
  desconto    numeric(10, 2) not null default 0,
  total       numeric(10, 2) not null,         -- já com desconto
  primary key (compra_id, item)
);

-- Histórico de preços: um registro por item de nota (ou por preço anotado à mão).
create table if not exists precos (
  id             bigint generated always as identity primary key,
  produto_id     text not null references produtos (id),
  loja_id        text not null references lojas (id),
  compra_id      text references compras (id) on delete cascade,
  item           text,
  data           timestamptz not null,
  qtd            numeric(10, 3) not null,
  preco_unit     numeric(10, 2) not null,
  desconto       numeric(10, 2) not null default 0,
  total          numeric(10, 2) not null,
  preco_efetivo  numeric(10, 2) not null,     -- total ÷ qtd (por kg nos itens pesados)
  origem         text not null default 'cupom' check (origem in ('cupom', 'etiqueta', 'manual')),
  criado_em      timestamptz not null default now(),
  unique (compra_id, item)
);

create index if not exists precos_produto_data on precos (produto_id, data desc);
create index if not exists precos_loja_data on precos (loja_id, data desc);

-- Último preço de cada produto em cada loja (base da comparação entre lojas).
create or replace view ultimo_preco_por_loja as
select distinct on (produto_id, loja_id)
  produto_id, loja_id, data, preco_efetivo, desconto
from precos
order by produto_id, loja_id, data desc;

-- Segurança: catálogo e histórico são públicos para leitura (a especificação permite
-- consultar sem conta); notas e seus itens só para o dono.
alter table lojas enable row level security;
alter table produtos enable row level security;
alter table precos enable row level security;
alter table compras enable row level security;
alter table itens_compra enable row level security;

create policy "leitura publica" on lojas for select using (true);
create policy "leitura publica" on produtos for select using (true);
create policy "leitura publica" on precos for select using (true);

create policy "dono le suas notas" on compras for select using (usuario_id = auth.uid());
create policy "dono grava suas notas" on compras for insert with check (usuario_id = auth.uid());
create policy "dono le itens" on itens_compra for select
  using (exists (select 1 from compras c where c.id = compra_id and c.usuario_id = auth.uid()));
