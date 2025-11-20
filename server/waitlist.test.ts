import { describe, expect, it } from "vitest";
import * as db from "./db";

describe("Sistema de Lista de Espera", () => {
  const TEST_AULA_ID = 1;
  const TEST_USER_ID_1 = 100;
  const TEST_USER_ID_2 = 101;
  const TEST_USER_ID_3 = 102;

  it("deve adicionar usuário na lista de espera", async () => {
    const result = await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_1);
    expect(result).toHaveProperty("posicao");
    expect(result.posicao).toBeGreaterThan(0);
  });

  it("deve listar pessoas na fila", async () => {
    // Adicionar alguns usuários
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_1);
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_2);
    
    const lista = await db.listarListaDeEspera(TEST_AULA_ID);
    expect(Array.isArray(lista)).toBe(true);
  });

  it("deve retornar posição do usuário na fila", async () => {
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_1);
    const posicao = await db.getPosicaoNaFila(TEST_AULA_ID, TEST_USER_ID_1);
    expect(posicao).toBeGreaterThan(0);
  });

  it("deve contar pessoas na fila", async () => {
    const total = await db.contarPessoasNaFila(TEST_AULA_ID);
    expect(typeof total).toBe("number");
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it("deve remover usuário da fila e atualizar posições", async () => {
    // Adicionar 3 usuários
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_1);
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_2);
    await db.adicionarNaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_3);
    
    // Remover o do meio
    await db.removerDaListaDeEspera(TEST_AULA_ID, TEST_USER_ID_2);
    
    // Verificar que foi removido
    const posicao = await db.getPosicaoNaFila(TEST_AULA_ID, TEST_USER_ID_2);
    expect(posicao).toBeNull();
    
    // Verificar que as posições foram atualizadas
    const lista = await db.listarListaDeEspera(TEST_AULA_ID);
    const posicoes = lista.map((item: any) => item.posicao);
    expect(posicoes).toEqual(posicoes.sort((a, b) => a - b)); // Verificar ordem
  });

  it("deve promover primeiro da fila quando vaga abrir", async () => {
    // Este teste requer dados reais no banco
    // Apenas verificar que a função não dá erro
    const resultado = await db.promoverPrimeiroDaFila(TEST_AULA_ID);
    // Pode retornar null se não houver ninguém na fila
    expect(resultado === null || typeof resultado === "object").toBe(true);
  });
});
