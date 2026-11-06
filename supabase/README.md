# Banco de dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode `schema.sql` e depois `seed.sql`.
3. Crie sua conta pelo app (ou em Authentication) e marque as notas como suas:

```sql
update compras set usuario_id = '<seu id em auth.users>' where usuario_id is null;
```

| Tabela | Conteúdo |
| --- | --- |
| `lojas` | Uma linha por loja (rede + unidade) |
| `produtos` | Catálogo; o id é o código de barras, ou `<rede>-<código>` para itens pesados |
| `compras` | Uma linha por NFC-e, com chave de acesso, totais e pagamentos |
| `itens_compra` | Itens de cada nota, como saíram no cupom |
| `precos` | Histórico: um preço por item de nota (ou anotado à mão) |
| `ultimo_preco_por_loja` | View com o último preço de cada produto em cada loja |

Catálogo e histórico podem ser lidos sem login; notas e itens só pelo dono (RLS).

Para atualizar o seed depois de registrar novas notas no protótipo: exporte para `app/src/data/seed.json` e rode `python3 supabase/gerar_seed.py`.
