import { useRef } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

export function useFIFACard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const gerarImagem = async (): Promise<string | null> => {
    if (!cardRef.current) {
      toast.error("Erro ao gerar card");
      return null;
    }

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#000000",
      });
      return dataUrl;
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar card");
      return null;
    }
  };

  const baixarImagem = async (nomeArquivo: string) => {
    const dataUrl = await gerarImagem();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${nomeArquivo}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("Card baixado com sucesso!");
  };

  const compartilharInstagram = async () => {
    const dataUrl = await gerarImagem();
    if (!dataUrl) return;

    // Converter data URL para blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "impacto-card.png", { type: "image/png" });

    // Verificar se o navegador suporta Web Share API
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "RX Nation",
          text: "Confira minha conquista na RX Nation! 💪🏆",
        });
        toast.success("Compartilhado com sucesso!");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Erro ao compartilhar:", error);
          // Fallback: baixar a imagem
          baixarImagem("impacto-card");
          toast.info("Imagem baixada! Compartilhe manualmente no Instagram.");
        }
      }
    } else {
      // Fallback: baixar a imagem
      baixarImagem("impacto-card");
      toast.info("Imagem baixada! Compartilhe manualmente no Instagram.");
    }
  };

  const copiarImagem = async () => {
    const dataUrl = await gerarImagem();
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Verificar se o navegador suporta Clipboard API
      if (navigator.clipboard && ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        toast.success("Card copiado! Cole no Instagram ou onde quiser.");
      } else {
        // Fallback: baixar a imagem
        baixarImagem("impacto-card");
        toast.info("Imagem baixada! Compartilhe manualmente.");
      }
    } catch (error) {
      console.error("Erro ao copiar:", error);
      baixarImagem("impacto-card");
      toast.info("Imagem baixada! Compartilhe manualmente.");
    }
  };

  return {
    cardRef,
    gerarImagem,
    baixarImagem,
    compartilharInstagram,
    copiarImagem,
  };
}
