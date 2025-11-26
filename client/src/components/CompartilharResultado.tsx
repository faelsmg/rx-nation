import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Download, Instagram } from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

interface CompartilharResultadoProps {
  wodTitulo: string;
  resultado: string;
  tipo: string;
  mediaBox?: number;
  percentil?: number;
  boxNome?: string;
}

export function CompartilharResultado({
  wodTitulo,
  resultado,
  tipo,
  mediaBox,
  percentil,
  boxNome,
}: CompartilharResultadoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const gerarCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensões para Instagram Stories (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Adicionar padrão de fundo sutil
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 100, 100);
    }

    // Logo do box (topo)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(boxNome || APP_TITLE, canvas.width / 2, 120);

    // Linha decorativa
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(340, 180);
    ctx.lineTo(740, 180);
    ctx.stroke();

    // WOD do Dia
    ctx.fillStyle = "#9ca3af";
    ctx.font = "32px Arial";
    ctx.fillText("WOD DO DIA", canvas.width / 2, 280);

    // Título do WOD
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Arial";
    const wodLines = wrapText(ctx, wodTitulo, canvas.width - 160, 56);
    wodLines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, 380 + i * 70);
    });

    // Card de resultado (centro)
    const cardY = 600;
    const cardHeight = 400;
    
    // Background do card
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    roundRect(ctx, 80, cardY, canvas.width - 160, cardHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Tipo de resultado
    ctx.fillStyle = "#3b82f6";
    ctx.font = "28px Arial";
    ctx.fillText(tipo.toUpperCase(), canvas.width / 2, cardY + 60);

    // Resultado principal
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 96px Arial";
    ctx.fillText(resultado, canvas.width / 2, cardY + 180);

    // Comparação com média (se disponível)
    if (mediaBox !== undefined && percentil !== undefined) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "32px Arial";
      ctx.fillText(`Média do Box: ${mediaBox}`, canvas.width / 2, cardY + 260);

      // Percentil
      const percentilColor = percentil <= 25 ? "#10b981" : percentil <= 50 ? "#3b82f6" : percentil <= 75 ? "#f59e0b" : "#9ca3af";
      ctx.fillStyle = percentilColor;
      ctx.font = "bold 40px Arial";
      ctx.fillText(`Top ${percentil}%`, canvas.width / 2, cardY + 330);
    }

    // Footer
    ctx.fillStyle = "#9ca3af";
    ctx.font = "28px Arial";
    ctx.fillText("RX NATION PRO LEAGUE", canvas.width / 2, 1780);

    ctx.fillStyle = "#6b7280";
    ctx.font = "24px Arial";
    ctx.fillText("Compartilhe seu resultado!", canvas.width / 2, 1840);

    // Converter para imagem
    const dataUrl = canvas.toDataURL("image/png");
    setImageUrl(dataUrl);
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.download = `resultado-wod-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    toast.success("Imagem baixada! Compartilhe nas suas redes sociais 🚀");
  };

  const compartilharWhatsApp = () => {
    if (!imageUrl) return;
    
    // No mobile, o usuário precisará salvar a imagem primeiro
    toast.info("Salve a imagem e compartilhe no WhatsApp Status!");
    downloadImage();
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    // Gerar card quando abrir o dialog
    setTimeout(() => gerarCard(), 100);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleOpenDialog}>
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Resultado</DialogTitle>
          <DialogDescription>
            Baixe e compartilhe seu resultado nas redes sociais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview do card */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={downloadImage} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
            <Button onClick={compartilharWhatsApp} variant="outline" className="w-full">
              <Instagram className="w-4 h-4 mr-2" />
              Stories
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Otimizado para Instagram Stories (1080x1920) e WhatsApp Status
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Função auxiliar para quebrar texto em múltiplas linhas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Função auxiliar para desenhar retângulo com bordas arredondadas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
