import { describe, it, expect } from "vitest";
import { gerarHTMLRelatorio } from "./_core/email";

describe("Sistema de Email - Relatórios", () => {
  const relatorioMock = {
    periodo: {
      inicio: new Date('2025-01-13'),
      fim: new Date('2025-01-20'),
    },
    inscricoes: {
      total: 45,
      pagas: 38,
      pendentes: 7,
    },
    receita: {
      total: 3800,
      media: 100,
    },
    campeonatos: {
      novos: 3,
      ativos: 2,
    },
    engajamento: {
      resultadosRegistrados: 120,
      novosUsuarios: 15,
    },
  };

  describe("Geração de HTML", () => {
    it("gera HTML válido", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="pt-BR">');
      expect(html).toContain('</html>');
    });

    it("inclui título do relatório", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('Relatório Semanal');
    });

    it("inclui período do relatório", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      // Verifica que contém datas formatadas (formato pode variar)
      expect(html).toContain('Período:');
      expect(html).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Formato DD/MM/YYYY
    });

    it("inclui métricas de inscrições", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('45'); // total
      expect(html).toContain('38'); // pagas
      expect(html).toContain('7'); // pendentes
    });

    it("inclui métricas de receita", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('3.800'); // receita total formatada
      expect(html).toContain('100'); // ticket médio
    });

    it("inclui métricas de campeonatos", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('3'); // novos
      expect(html).toContain('2'); // ativos
    });

    it("inclui métricas de engajamento", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('120'); // resultados
      expect(html).toContain('15'); // novos usuários
    });

    it("inclui estilos CSS inline", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
      expect(html).toContain('font-family');
      expect(html).toContain('background');
    });

    it("inclui seções organizadas", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('Inscrições');
      expect(html).toContain('Campeonatos');
      expect(html).toContain('Engajamento');
    });

    it("inclui destaque para receita total", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('Receita Total');
      expect(html).toContain('destaque');
    });

    it("inclui footer com informações", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('Impacto Pro League');
      expect(html).toContain('relatório automático');
    });
  });

  describe("Formatação de Valores", () => {
    it("formata valores monetários corretamente", () => {
      const relatorio = {
        ...relatorioMock,
        receita: {
          total: 12345,
          media: 250,
        },
      };
      
      const html = gerarHTMLRelatorio(relatorio);
      
      expect(html).toContain('12.345');
      expect(html).toContain('250');
    });

    it("formata datas no padrão brasileiro", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      // Verifica formato DD/MM/YYYY
      expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("lida com valores zero", () => {
      const relatorio = {
        ...relatorioMock,
        inscricoes: {
          total: 0,
          pagas: 0,
          pendentes: 0,
        },
      };
      
      const html = gerarHTMLRelatorio(relatorio);
      
      expect(html).toContain('0');
    });
  });

  describe("Responsividade", () => {
    it("inclui meta viewport para mobile", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });

    it("usa max-width para container", () => {
      const html = gerarHTMLRelatorio(relatorioMock);
      
      expect(html).toContain('max-width');
    });
  });
});
