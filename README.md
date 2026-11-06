# Compara

App para conferir o preço pago no caixa e acompanhar o histórico de preços das suas compras.

| Pasta | O que tem |
| --- | --- |
| `app/` | Aplicativo (Expo + React Native + TypeScript), com o design do protótipo do MVP |
| `supabase/` | Esquema do banco (PostgreSQL) e seed com as notas já registradas |
| `site/` | Landing page |

## Rodar o app

```bash
cd app
npm install
npx expo start
```

Abra no celular com o app **Expo Go** (lendo o QR Code do terminal) ou aperte `w` para ver no navegador. A leitura do QR Code do cupom precisa da câmera do celular; no navegador, use o campo de chave de acesso.

## Estado atual (fatia 1)

- **Início**: busca, lojas onde você comprou e últimos preços pagos, com o preço da outra loja quando existe.
- **Cupom**: lê o QR Code da NFC-e (ou a chave digitada), valida a chave e abre a nota se ela já estiver registrada.
- **Histórico**: busca em todos os produtos; cada produto tem gráfico, mínimo, máximo, último e comparação entre lojas.
- **Nota**: itens cobrados, descontos e pagamentos.

Os dados vêm de `app/src/data/seed.json` (2 notas: Giga Atacado e Assaí). A troca para o Supabase acontece em `app/src/data/repo.ts`.

## Próximas fatias

1. Ligar o app ao Supabase (login e leitura das tabelas) e importar os itens de uma nota nova a partir da chave.
2. Registrar etiqueta na gôndola e conferir com o cupom (telas 4, 6 e 7 do protótipo).
3. Seguir produtos e alertas de reajuste.
