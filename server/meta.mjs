export const meta = {
  repo: "azimute-api",
  title: "Azimute API",
  engine: "trpc-zod",
  accent: "#24577a",
  headline: "Menos pontos. A mesma trajetória dentro do limite.",
  description:
    "Meça trajetos e simplifique linhas geográficas com distância a arcos de grande círculo. API tRPC tipada, validação Zod e processamento real no servidor.",
  behavior:
    "Coordenadas seguem [longitude,latitude]. O modelo usa uma esfera de raio 6371008,8 m. A simplificação Douglas–Peucker preserva extremos e informa o maior desvio dos pontos originais em cada trecho. A caixa dos pontos reconhece a travessia do antimeridiano.",
  limits:
    "2–256 pontos; tolerância de 0–10000 m. Sem mapas, geocodificação, trânsito ou armazenamento. A esfera é uma aproximação; não serve para navegação de segurança. Arcos com extremos quase antípodas usam distância conservadora aos extremos.",
  primary: "/api/trpc/simplify",
  secondary: "/api/trpc/analyze",
  primaryLabel: "Simplificar trajeto →",
  secondaryLabel: "Medir trajeto",
  examples: [
    {
      name: "Linha com ruído",
      input: {
        points: [
          [0, 0],
          [0.001, 0.00001],
          [0.002, 0],
          [0.003, 0.001],
          [0.004, 0.002],
        ],
        tolerance_m: 5,
      },
    },
    {
      name: "Antimeridiano",
      input: {
        points: [
          [179.9, 0],
          [180, 0],
          [-179.9, 0],
        ],
        tolerance_m: 1,
      },
    },
    {
      name: "Curva preservada",
      input: {
        points: [
          [0, 0],
          [0.001, 0.001],
          [0.002, 0],
        ],
        tolerance_m: 10,
      },
    },
  ],
};
