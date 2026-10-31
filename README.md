# Azimute API

Medição e simplificação de trajetos geográficos.

**Stack:** TypeScript + tRPC 11 + Zod 4. Backend real. Vinext/React fornecem transporte e laboratório técnico, sem substituir as regras do servidor.

- [Demo](https://azimute-api-gustapaz.starrylinen.chatgpt.site)
- [Documentação](https://azimute-api-gustapaz.starrylinen.chatgpt.site/docs.html)
- [Arquitetura](docs/architecture.md) · [Segurança](docs/security.md)

## Executar localmente

Node.js 24 e npm; nenhuma conta, cartão ou segredo para execução local.

```sh
npm ci
npm test
npm run build
npm start -- --port 5232
```

Em outro terminal:

```sh
npm run smoke -- http://127.0.0.1:5232
```

O smoke usa apenas dados sintéticos. Não grava dados nem chama serviços externos. Veja examples/request.json para a entrada inicial.

## Contrato e arquitetura

POST /api/trpc/analyze; POST /api/trpc/simplify; GET /api/health; GET /api/v1/examples. Sem batching ou parâmetros de URL. Sucesso em result.data; erro tRPC em error.

Router tRPC tipado com validação Zod estrita. Vetores unitários e ângulos atan2 medem distâncias esféricas. Douglas–Peucker iterativo preserva extremos; cada ponto é medido no seu intervalo original. Arcos degenerados ou quase antípodas usam distância conservadora aos extremos. Bounds cobrem os pontos, não o interior dos arcos.

## Testes e CI

15 testes, incluindo distância analítica, polos, antimeridiano, duplicatas, HTTP tRPC/Zod e 200 trajetos gerados com invariantes. A CI executa instalação limpa, testes, tipos, formatação e build. Use também npm run check e npm run typecheck.

## Hospedagem e limites

2–256 coordenadas [longitude,latitude], tolerância 0–10000 m. Esfera de raio 6371008,8 m, não elipsoide WGS84. Sem armazenamento, mapas, geocodificação, trânsito ou navegação de segurança. JSON até 32 KiB.

Sem estado: entradas não são armazenadas.

Demo gratuita no Sites/Cloudflare Workers, sem cartão, trial ou faturamento ativado. A disponibilidade e as cotas dependem da hospedagem; não há SLA nem promessa de gratuidade permanente.

Dados da demonstração são sintéticos. Regras internas são reais. Não há efeitos externos mockados apresentados como processamento real.

## Licença

MIT — Gustavo Paz. Arquivos e dependências de terceiros preservam suas próprias licenças e avisos.
