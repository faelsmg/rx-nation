import { invokeLLM } from "./_core/llm";
import * as db from "./db";

interface DesafioGerado {
  tipo: "checkins" | "wods" | "prs" | "streak" | "custom";
  titulo: string;
  descricao: string;
  meta: number;
  pontosRecompensa: number;
  icone: string;
}

/**
 * Gera 3 desafios personalizados usando IA baseado no histórico do atleta
 */
export async function gerarDesafiosPersonalizadosIA(userId: number, boxId?: number): Promise<DesafioGerado[]> {
  // Buscar histórico do atleta
  const [stats, prs, streakInfo] = await Promise.all([
    db.getUserStatsForBadges(userId),
    db.getPrsByUser(userId),
    db.getOrCreateStreak(userId),
  ]);

  // Montar contexto do atleta
  const contexto = `
Atleta ID: ${userId}
Estatísticas dos últimos 30 dias:
- Check-ins: ${stats.totalCheckins}
- WODs completados: ${stats.totalWods}
- PRs registrados: ${stats.totalPRs}
- Streak atual: ${streakInfo.streakAtual} dias
- Melhor streak: ${streakInfo.melhorStreak} dias

PRs registrados (últimos 5):
${prs.slice(0, 5).map(pr => `- ${pr.movimento}: ${pr.carga}kg`).join('\n') || 'Nenhum PR registrado ainda'}
  `.trim();

  // Prompt para IA
  const prompt = `
Você é um coach de CrossFit especializado em gamificação e motivação de atletas.

Analise o histórico do atleta abaixo e gere EXATAMENTE 3 desafios semanais personalizados que sejam:
1. Desafiadores mas alcançáveis (baseados no histórico real)
2. Variados (misture tipos diferentes: frequência, WODs, PRs, streaks)
3. Motivadores (use linguagem inspiradora)

${contexto}

REGRAS IMPORTANTES:
- Meta deve ser um número inteiro positivo
- Pontos de recompensa: 50-150 (mais difícil = mais pontos)
- Tipo deve ser um de: checkins, wods, prs, streak, custom
- Ícone deve ser um emoji único para cada desafio
- Título: máximo 30 caracteres
- Descrição: máximo 100 caracteres

Retorne APENAS um JSON válido no formato:
[
  {
    "tipo": "checkins",
    "titulo": "Frequência Perfeita",
    "descricao": "Complete 5 check-ins esta semana",
    "meta": 5,
    "pontosRecompensa": 100,
    "icone": "🔥"
  },
  ...
]
`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um coach de CrossFit especializado em gamificação." },
        { role: "user", content: prompt }
      ],
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "desafios_semanais",
          strict: true,
          schema: {
            type: "object",
            properties: {
              desafios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    tipo: {
                      type: "string",
                      enum: ["checkins", "wods", "prs", "streak", "custom"]
                    },
                    titulo: { type: "string" },
                    descricao: { type: "string" },
                    meta: { type: "integer" },
                    pontosRecompensa: { type: "integer" },
                    icone: { type: "string" }
                  },
                  required: ["tipo", "titulo", "descricao", "meta", "pontosRecompensa", "icone"],
                  additionalProperties: false
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ["desafios"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("IA não retornou conteúdo válido");
    }

    const parsed = JSON.parse(content);
    return parsed.desafios as DesafioGerado[];
  } catch (error) {
    console.error("[IA] Erro ao gerar desafios personalizados:", error);
    
    // Fallback: desafios genéricos baseados em estatísticas
    return gerarDesafiosFallback(stats, streakInfo);
  }
}

/**
 * Fallback: gera desafios genéricos se a IA falhar
 */
function gerarDesafiosFallback(stats: any, streakInfo: any): DesafioGerado[] {
  const desafios: DesafioGerado[] = [];

  // Desafio de frequência (baseado na média)
  const metaCheckins = Math.max(3, Math.ceil(stats.totalCheckins * 1.2));
  desafios.push({
    tipo: "checkins",
    titulo: "Frequência Semanal",
    descricao: `Complete ${metaCheckins} check-ins esta semana`,
    meta: metaCheckins,
    pontosRecompensa: 100,
    icone: "🔥"
  });

  // Desafio de WODs (baseado na média)
  const metaWods = Math.max(3, Math.ceil(stats.totalWods * 1.1));
  desafios.push({
    tipo: "wods",
    titulo: "Guerreiro dos WODs",
    descricao: `Complete ${metaWods} WODs esta semana`,
    meta: metaWods,
    pontosRecompensa: 80,
    icone: "💪"
  });

  // Desafio de PRs ou Streak
  if (stats.totalPRs > 0) {
    const metaPrs = Math.max(1, Math.ceil(stats.totalPRs * 1.5));
    desafios.push({
      tipo: "prs",
      titulo: "Quebrando Limites",
      descricao: `Registre ${metaPrs} novos PRs esta semana`,
      meta: metaPrs,
      pontosRecompensa: 150,
      icone: "🏆"
    });
  } else {
    const metaStreak = Math.max(5, streakInfo.streakAtual + 2);
    desafios.push({
      tipo: "streak",
      titulo: "Consistência Total",
      descricao: `Mantenha um streak de ${metaStreak} dias`,
      meta: metaStreak,
      pontosRecompensa: 120,
      icone: "⚡"
    });
  }

  return desafios;
}

/**
 * Cria desafios personalizados no banco para um atleta
 */
export async function criarDesafiosPersonalizadosParaAtleta(userId: number, boxId?: number) {
  const desafios = await gerarDesafiosPersonalizadosIA(userId, boxId);
  
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semana = getNumeroSemana(hoje);
  const semanaAno = `${ano}-W${semana.toString().padStart(2, '0')}`;
  
  const inicioSemana = getInicioSemana(hoje);
  const fimSemana = getFimSemana(hoje);

  const desafiosCriados = [];

  for (const desafio of desafios) {
    const created = await db.criarDesafioSemanal({
      boxId: boxId || null,
      tipo: desafio.tipo,
      titulo: desafio.titulo,
      descricao: desafio.descricao,
      meta: desafio.meta,
      pontosRecompensa: desafio.pontosRecompensa,
      icone: desafio.icone,
      semanaAno,
      dataInicio: inicioSemana,
      dataFim: fimSemana,
      ativo: true,
    });
    desafiosCriados.push(created);
  }

  return desafiosCriados;
}

// Funções auxiliares
function getNumeroSemana(data: Date): number {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getInicioSemana(data: Date): Date {
  const d = new Date(data);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getFimSemana(data: Date): Date {
  const inicio = getInicioSemana(data);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}
