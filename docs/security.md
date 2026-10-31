# Proteções e limites

Entradas limitadas pelos bytes reais do stream, UTF-8 estrito e application/json. Rejeição de compressão e origem de navegador diferente; sem CORS aberto ou cookies. Respostas no-store, nosniff e request ID. Falhas internas sem stack; corpos e credenciais não são registrados. CORS não é autenticação.

2–256 coordenadas [longitude,latitude], tolerância 0–10000 m. Esfera de raio 6371008,8 m, não elipsoide WGS84. Sem armazenamento, mapas, geocodificação, trânsito ou navegação de segurança.

Limites de trabalho por requisição não são rate limit distribuído ou proteção DDoS. Sem credenciais, contas ou persistência. Use dados sintéticos.
