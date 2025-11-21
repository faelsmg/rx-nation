import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Exportar dados para PDF com formatação profissional
 */
export function exportToPDF(
  title: string,
  subtitle: string,
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string
) {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  // Subtítulo
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, 30);

  // Data de geração
  const dataGeracao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.text(`Gerado em: ${dataGeracao}`, 14, 36);

  // Tabela
  autoTable(doc, {
    startY: 42,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey] || "-")),
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246], // Azul primary
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Salvar
  doc.save(`${filename}.pdf`);
}

/**
 * Exportar dados para Excel com formatação
 */
export function exportToExcel(
  data: any[],
  columns: { header: string; dataKey: string }[],
  sheetName: string,
  filename: string
) {
  // Preparar dados com cabeçalhos
  const worksheetData = [
    columns.map((col) => col.header),
    ...data.map((row) => columns.map((col) => row[col.dataKey] || "-")),
  ];

  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Ajustar largura das colunas
  const columnWidths = columns.map((col) => ({
    wch: Math.max(
      col.header.length,
      ...data.map((row) => String(row[col.dataKey] || "").length)
    ),
  }));
  worksheet["!cols"] = columnWidths;

  // Criar workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Salvar
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Exportar métricas de dashboard para PDF
 */
export function exportMetricasToPDF(
  boxNome: string,
  metricas: {
    totalAtletas: number;
    taxaEngajamento: number;
    wodsPublicados: number;
    checkinsUltimos30Dias: number;
  },
  topAtletas: any[],
  filename: string
) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Métricas", 14, 22);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(boxNome, 14, 32);

  doc.setFontSize(10);
  const dataGeracao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.text(`Período: Últimos 30 dias | Gerado em: ${dataGeracao}`, 14, 40);

  // Seção de Métricas Gerais
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Métricas Gerais", 14, 52);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let yPos = 60;

  const metricasTexto = [
    `Total de Atletas: ${metricas.totalAtletas}`,
    `Taxa de Engajamento: ${metricas.taxaEngajamento}%`,
    `WODs Publicados: ${metricas.wodsPublicados}`,
    `Check-ins (30 dias): ${metricas.checkinsUltimos30Dias}`,
  ];

  metricasTexto.forEach((texto) => {
    doc.text(texto, 20, yPos);
    yPos += 8;
  });

  // Seção de Top Atletas
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top 10 Atletas", 14, yPos);

  yPos += 8;
  autoTable(doc, {
    startY: yPos,
    head: [["Posição", "Nome", "Pontos", "Badges"]],
    body: topAtletas.map((atleta, index) => [
      `${index + 1}º`,
      atleta.nome || "Sem nome",
      atleta.pontos || 0,
      atleta.total_badges || 0,
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });

  // Rodapé
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.text(
    "Impacto Pro League - Relatório Confidencial",
    doc.internal.pageSize.getWidth() / 2,
    pageHeight - 10,
    { align: "center" }
  );

  doc.save(`${filename}.pdf`);
}
