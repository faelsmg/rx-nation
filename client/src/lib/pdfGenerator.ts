import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_TITLE } from "@/const";

export interface AvaliacaoFisica {
  data: string;
  peso: number;
  altura: number;
  percentualGordura?: number;
  imc: number;
  cintura?: number;
  quadril?: number;
  braco?: number;
  perna?: number;
  observacoes?: string;
}

export interface DadosAtleta {
  nome: string;
  email: string;
  categoria?: string;
}

export function gerarPDFAvaliacaoFisica(
  atleta: DadosAtleta,
  avaliacoes: AvaliacaoFisica[]
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(APP_TITLE, 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório de Avaliação Física", 105, 30, { align: "center" });
  
  // Dados do Atleta
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dados do Atleta", 14, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome: ${atleta.nome}`, 14, 52);
  doc.text(`Email: ${atleta.email}`, 14, 58);
  if (atleta.categoria) {
    doc.text(`Categoria: ${atleta.categoria}`, 14, 64);
  }
  
  // Tabela de Avaliações
  const tableData = avaliacoes.map((av) => [
    new Date(av.data).toLocaleDateString("pt-BR"),
    `${av.peso} kg`,
    `${av.altura} cm`,
    av.percentualGordura ? `${av.percentualGordura}%` : "-",
    av.imc.toFixed(1),
    av.cintura ? `${av.cintura} cm` : "-",
    av.quadril ? `${av.quadril} cm` : "-",
  ]);
  
  autoTable(doc, {
    head: [["Data", "Peso", "Altura", "% Gordura", "IMC", "Cintura", "Quadril"]],
    body: tableData,
    startY: 75,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  // Observações da última avaliação
  const ultimaAvaliacao = avaliacoes[avaliacoes.length - 1];
  if (ultimaAvaliacao?.observacoes) {
    const finalY = (doc as any).lastAutoTable.finalY || 75;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Observações:", 14, finalY + 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(ultimaAvaliacao.observacoes, 180);
    doc.text(splitText, 14, finalY + 22);
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      105,
      285,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
  }
  
  return doc;
}

export function gerarPDFEvolucao(
  atleta: DadosAtleta,
  prs: Array<{ movimento: string; carga: number; data: string }>
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text(APP_TITLE, 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Relatório de Evolução de Performance", 105, 30, { align: "center" });
  
  // Dados do Atleta
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Atleta", 14, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome: ${atleta.nome}`, 14, 52);
  
  // Tabela de PRs
  const tableData = prs.map((pr) => [
    pr.movimento,
    `${pr.carga} kg`,
    new Date(pr.data).toLocaleDateString("pt-BR"),
  ]);
  
  autoTable(doc, {
    head: [["Movimento", "Carga (PR)", "Data"]],
    body: tableData,
    startY: 65,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
      105,
      285,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
  }
  
  return doc;
}

export function gerarCertificadoBadge(
  atleta: DadosAtleta,
  badge: { nome: string; descricao: string; dataConquista: string }
) {
  const doc = new jsPDF({
    orientation: "landscape",
  });
  
  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  
  // Title
  doc.setFontSize(32);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICADO DE CONQUISTA", 148.5, 40, { align: "center" });
  
  // Badge Icon (emoji)
  doc.setFontSize(48);
  doc.text("🏆", 148.5, 75, { align: "center" });
  
  // Text
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("Certificamos que", 148.5, 95, { align: "center" });
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(atleta.nome, 148.5, 110, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("conquistou o badge", 148.5, 125, { align: "center" });
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text(badge.nome, 148.5, 140, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "italic");
  doc.text(badge.descricao, 148.5, 150, { align: "center" });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Data da conquista: ${new Date(badge.dataConquista).toLocaleDateString("pt-BR")}`,
    148.5,
    170,
    { align: "center" }
  );
  
  // Footer
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text(APP_TITLE, 148.5, 185, { align: "center" });
  
  return doc;
}
