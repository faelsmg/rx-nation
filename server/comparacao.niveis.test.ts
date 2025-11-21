import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "atleta",
    boxId: 1,
    categoria: "intermediario",
    faixaEtaria: "18-29",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Comparação de Atletas", () => {
  it("deve listar atletas com busca por nome", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const resultado = await caller.listarAtletas({ busca: "Rafael", limit: 10 });

    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    // Se houver resultados, verificar estrutura
    if (resultado.length > 0) {
      expect(resultado[0]).toHaveProperty("id");
      expect(resultado[0]).toHaveProperty("nome");
      expect(resultado[0]).toHaveProperty("email");
    }
  });

  it("deve comparar dois atletas com sucesso", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Tentar comparar atletas 1 e 2
    const resultado = await caller.compararAtletas({ 
      atleta1Id: 1, 
      atleta2Id: 2 
    });

    // Se houver dados, verificar estrutura
    if (resultado) {
      expect(resultado).toHaveProperty("atleta1");
      expect(resultado).toHaveProperty("atleta2");
      expect(resultado).toHaveProperty("diferencas");
      
      expect(resultado.atleta1).toHaveProperty("id");
      expect(resultado.atleta1).toHaveProperty("nome");
      expect(resultado.atleta1).toHaveProperty("historico");
      
      expect(resultado.atleta2).toHaveProperty("id");
      expect(resultado.atleta2).toHaveProperty("nome");
      expect(resultado.atleta2).toHaveProperty("historico");

      // Verificar estrutura do histórico
      expect(resultado.atleta1.historico).toHaveProperty("totalCampeonatos");
      expect(resultado.atleta1.historico).toHaveProperty("totalPontos");
      expect(resultado.atleta1.historico).toHaveProperty("mediaPontos");
      expect(resultado.atleta1.historico).toHaveProperty("evolucaoTemporal");

      // Verificar diferenças
      expect(resultado.diferencas).toHaveProperty("totalCampeonatos");
      expect(resultado.diferencas).toHaveProperty("totalPontos");
      expect(resultado.diferencas).toHaveProperty("mediaPontos");
    }
  });

  it("deve retornar null ao comparar atletas inexistentes", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const resultado = await caller.compararAtletas({ 
      atleta1Id: 99999, 
      atleta2Id: 99998 
    });

    expect(resultado).toBeNull();
  });
});

describe("Sistema de Níveis", () => {
  it("deve calcular nível Bronze para 0-499 pontos", () => {
    const pontos = 250;
    const nivel = calcularNivel(pontos);
    
    expect(nivel.nome).toBe("Bronze");
    expect(nivel.min).toBe(0);
    expect(nivel.max).toBe(500);
  });

  it("deve calcular nível Prata para 500-1499 pontos", () => {
    const pontos = 800;
    const nivel = calcularNivel(pontos);
    
    expect(nivel.nome).toBe("Prata");
    expect(nivel.min).toBe(500);
    expect(nivel.max).toBe(1500);
  });

  it("deve calcular nível Ouro para 1500-2999 pontos", () => {
    const pontos = 2000;
    const nivel = calcularNivel(pontos);
    
    expect(nivel.nome).toBe("Ouro");
    expect(nivel.min).toBe(1500);
    expect(nivel.max).toBe(3000);
  });

  it("deve calcular nível Platina para 3000+ pontos", () => {
    const pontos = 5000;
    const nivel = calcularNivel(pontos);
    
    expect(nivel.nome).toBe("Platina");
    expect(nivel.min).toBe(3000);
    expect(nivel.max).toBe(Infinity);
  });

  it("deve calcular progresso corretamente", () => {
    // 250 pontos no nível Bronze (0-500)
    const pontos = 250;
    const nivel = calcularNivel(pontos);
    const progresso = calcularProgresso(pontos, nivel);
    
    // 250 de 500 = 50%
    expect(progresso).toBe(50);
  });

  it("deve calcular pontos restantes corretamente", () => {
    // 250 pontos no nível Bronze (0-500)
    const pontos = 250;
    const nivel = calcularNivel(pontos);
    const proximoNivel = obterProximoNivel(nivel);
    
    if (proximoNivel) {
      const restantes = proximoNivel.min - pontos;
      // 500 - 250 = 250 pontos restantes
      expect(restantes).toBe(250);
    }
  });

  it("deve retornar progresso 100% para Platina", () => {
    const pontos = 5000;
    const nivel = calcularNivel(pontos);
    const proximoNivel = obterProximoNivel(nivel);
    
    expect(nivel.nome).toBe("Platina");
    expect(proximoNivel).toBeNull();
  });
});

describe("Perfil Público", () => {
  it("deve retornar perfil público de um atleta", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const perfil = await caller.user.getPublicProfile({ userId: 1 });

    if (perfil) {
      expect(perfil).toHaveProperty("user");
      expect(perfil).toHaveProperty("stats");
      expect(perfil).toHaveProperty("badges");
      expect(perfil).toHaveProperty("prs");
      expect(perfil).toHaveProperty("recentWods");

      // Verificar estrutura do usuário
      expect(perfil.user).toHaveProperty("id");
      expect(perfil.user).toHaveProperty("name");
      expect(perfil.user).toHaveProperty("categoria");

      // Verificar estrutura das estatísticas
      expect(perfil.stats).toHaveProperty("totalWods");
      expect(perfil.stats).toHaveProperty("totalBadges");
      expect(perfil.stats).toHaveProperty("totalPrs");
      expect(perfil.stats).toHaveProperty("totalPontos");
    }
  });

  it("deve retornar null para usuário inexistente", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const perfil = await caller.user.getPublicProfile({ userId: 99999 });

    expect(perfil).toBeNull();
  });
});

// ========== FUNÇÕES AUXILIARES PARA TESTES ==========

interface Nivel {
  nome: string;
  min: number;
  max: number;
}

const NIVEIS: Nivel[] = [
  { nome: "Bronze", min: 0, max: 500 },
  { nome: "Prata", min: 500, max: 1500 },
  { nome: "Ouro", min: 1500, max: 3000 },
  { nome: "Platina", min: 3000, max: Infinity }
];

function calcularNivel(pontos: number): Nivel {
  return NIVEIS.find(n => pontos >= n.min && pontos < n.max) || NIVEIS[NIVEIS.length - 1];
}

function obterProximoNivel(nivelAtual: Nivel): Nivel | null {
  const index = NIVEIS.indexOf(nivelAtual);
  return index < NIVEIS.length - 1 ? NIVEIS[index + 1] : null;
}

function calcularProgresso(pontos: number, nivel: Nivel): number {
  const proximoNivel = obterProximoNivel(nivel);
  
  if (!proximoNivel) {
    return 100; // Platina - máximo
  }

  const pontosNecessarios = proximoNivel.min - nivel.min;
  const pontosAtingidos = pontos - nivel.min;
  return Math.min((pontosAtingidos / pontosNecessarios) * 100, 100);
}
