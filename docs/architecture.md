# Arquitetura e aprendizado

Router tRPC tipado com validação Zod estrita. Vetores unitários e ângulos atan2 medem distâncias esféricas. Douglas–Peucker iterativo preserva extremos; cada ponto é medido no seu intervalo original. Arcos degenerados ou quase antípodas usam distância conservadora aos extremos. Bounds cobrem os pontos, não o interior dos arcos.

Objetivo: estudar Medição e simplificação de trajetos geográficos.

POST /api/trpc/analyze; POST /api/trpc/simplify; GET /api/health; GET /api/v1/examples. Sem batching ou parâmetros de URL. Sucesso em result.data; erro tRPC em error.

2–256 coordenadas [longitude,latitude], tolerância 0–10000 m. Esfera de raio 6371008,8 m, não elipsoide WGS84. Sem armazenamento, mapas, geocodificação, trânsito ou navegação de segurança.
