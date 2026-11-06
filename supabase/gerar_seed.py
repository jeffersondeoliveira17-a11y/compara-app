"""Gera supabase/seed.sql a partir de app/src/data/seed.json (dados exportados do Compara Preços).

Uso:  python3 supabase/gerar_seed.py
As notas entram sem dono (usuario_id nulo). Depois de criar sua conta no app, rode:
  update compras set usuario_id = '<seu id em auth.users>' where usuario_id is null;
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
seed = json.loads((RAIZ / "app/src/data/seed.json").read_text(encoding="utf-8"))


def q(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, (dict, list)):
        v = json.dumps(v, ensure_ascii=False)
    return "'" + str(v).replace("'", "''") + "'"


def insert(tabela, colunas, linhas):
    if not linhas:
        return ""
    valores = ",\n".join("  (" + ", ".join(q(x) for x in l) + ")" for l in linhas)
    return f"insert into {tabela} ({', '.join(colunas)}) values\n{valores}\non conflict do nothing;\n\n"


sql = "-- Gerado por supabase/gerar_seed.py — não edite à mão.\n\n"
sql += insert(
    "lojas",
    ["id", "nome", "unidade", "endereco", "cnpj", "razao_social"],
    [[l["id"], l["nome"], l.get("unidade"), l.get("endereco"), l.get("cnpj"), l.get("razaoSocial")] for l in seed["lojas"]],
)
sql += insert(
    "produtos",
    ["id", "descricao", "codigo", "ean", "codigo_interno", "unidade"],
    [[p["id"], p["descricao"], p.get("codigo"), p.get("ean"), p.get("codigoInterno", False), p["unidade"]] for p in seed["produtos"]],
)
sql += insert(
    "compras",
    ["id", "loja_id", "data", "chave", "nfce", "serie", "coo", "operador", "total_itens",
     "valor_total", "desconto", "valor_pago", "pagamentos", "tributos", "observacao"],
    [[c["id"], c["lojaId"], c["data"], c["chave"], c["nfce"], c["serie"], c.get("coo"), c.get("operador"),
      c["totalItens"], c["valorTotal"], c.get("desconto", 0), c["valorPago"], c.get("pagamentos", []),
      c.get("tributos"), c.get("observacao")] for c in seed["compras"]],
)
sql += insert(
    "itens_compra",
    ["compra_id", "item", "produto_id", "descricao", "qtd", "unidade", "preco_unit", "desconto", "total"],
    [[c["id"], i["item"], i["produtoId"], i["descricao"], i["qtd"], i["unidade"], i["precoUnit"], i.get("desconto", 0), i["total"]]
     for c in seed["compras"] for i in c["itens"]],
)
sql += insert(
    "precos",
    ["produto_id", "loja_id", "compra_id", "item", "data", "qtd", "preco_unit", "desconto", "total", "preco_efetivo", "origem"],
    [[p["id"], r["lojaId"], r.get("compraId"), r.get("item"), r["data"], r["qtd"], r["precoUnit"], r.get("desconto", 0),
      r["total"], r["precoEfetivo"], r.get("origem") or ("cupom" if r.get("compraId") else "manual")]
     for p in seed["produtos"] for r in p["registros"]],
)

(RAIZ / "supabase/seed.sql").write_text(sql, encoding="utf-8")
n_precos = sum(len(p["registros"]) for p in seed["produtos"])
print(f"seed.sql: {len(seed['lojas'])} lojas, {len(seed['produtos'])} produtos, {len(seed['compras'])} notas, {n_precos} preços")
