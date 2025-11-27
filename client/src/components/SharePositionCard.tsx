import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar } from "@/components/Avatar";
import { Share2, Download } from "lucide-react";
import { APP_LOGO } from "@/const";
import { toast } from "sonner";

type Nivel = "bronze" | "prata" | "ouro" | "platina";

interface SharePositionCardProps {
  posicao: number;
  userName: string;
  userAvatar?: string | null;
  nivel: Nivel;
  pontosTotal: number;
  boxNome: string;
  categoria: string;
  userId: number;
}

/**
 * Componente de Card de Compartilhamento Social
 * Gera imagem estilo FIFA para compartilhar posição no leaderboard
 */
export function SharePositionCard({
  posicao,
  userName,
  userAvatar,
  nivel,
  pontosTotal,
  boxNome,
  categoria,
  userId,
}: SharePositionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Verificar suporte à Web Share API
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function" && typeof navigator.canShare === "function";

  // Configurações de cores por nível
  const niveisConfig = {
    bronze: {
      nome: "Bronze",
      gradient: "from-amber-700 via-amber-600 to-amber-800",
      bgColor: "#92400e",
      textColor: "#fef3c7",
      icone: "🥉",
    },
    prata: {
      nome: "Prata",
      gradient: "from-gray-400 via-gray-300 to-gray-500",
      bgColor: "#6b7280",
      textColor: "#f3f4f6",
      icone: "🥈",
    },
    ouro: {
      nome: "Ouro",
      gradient: "from-yellow-400 via-yellow-300 to-yellow-600",
      bgColor: "#ca8a04",
      textColor: "#fef9c3",
      icone: "🥇",
    },
    platina: {
      nome: "Platina",
      gradient: "from-cyan-400 via-blue-300 to-purple-500",
      bgColor: "#0891b2",
      textColor: "#ecfeff",
      icone: "💎",
    },
  };

  const config = niveisConfig[nivel];

  // Gerar URL do perfil público
  const profileUrl = `${window.location.origin}/atleta/${userId}`;

  // Função para gerar canvas
  const generateCanvas = async () => {
    if (!cardRef.current) return null;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });
      return canvas;
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem. Tente novamente.");
      return null;
    }
  };

  // Função para compartilhar via Web Share API
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const canvas = await generateCanvas();
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      // Converter canvas para Blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Erro ao processar imagem.");
          setIsSharing(false);
          return;
        }

        const file = new File([blob], `rx-nation-posicao-${posicao}.png`, {
          type: "image/png",
        });

        // Verificar se pode compartilhar arquivo
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `RX Nation - Posição #${posicao}`,
              text: `Estou na posição #${posicao} no Leaderboard da RX Nation! 🏆 ${pontosTotal} pontos no nível ${config.nome}. Confira meu perfil:`,
            });
            toast.success("Compartilhado com sucesso! 🎉");
          } catch (error: any) {
            // Usuário cancelou o compartilhamento
            if (error.name !== "AbortError") {
              console.error("Erro ao compartilhar:", error);
              toast.error("Erro ao compartilhar. Tente baixar a imagem.");
            }
          }
        } else {
          // Fallback: baixar imagem
          toast.info("Compartilhamento não suportado. Baixando imagem...");
          const link = document.createElement("a");
          link.download = `rx-nation-posicao-${posicao}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }

        setIsSharing(false);
      }, "image/png");
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Erro ao compartilhar. Tente novamente.");
      setIsSharing(false);
    }
  };

  // Função para baixar a imagem
  const handleDownload = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `rx-nation-posicao-${posicao}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Imagem baixada com sucesso!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compartilhar Posição no Leaderboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Visual (será convertido em imagem) */}
          <div
            ref={cardRef}
            className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${config.bgColor} 0%, #1a1a1a 100%)`,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative h-full p-8 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={APP_LOGO} alt="RX Nation" className="w-12 h-12 rounded-lg" />
                  <div>
                    <div className="text-white font-bold text-xl">RX NATION</div>
                    <div className="text-white/80 text-sm">Pro League</div>
                  </div>
                </div>

                {/* Posição Destaque */}
                <div className="text-right">
                  <div className="text-white/80 text-sm font-semibold">POSIÇÃO</div>
                  <div className="text-white font-black text-5xl leading-none">
                    #{posicao}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex items-end justify-between gap-8">
                {/* Atleta Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Avatar
                        src={userAvatar}
                        alt={userName}
                        fallback={userName}
                        size="lg"
                        className="border-4 border-white/30"
                      />
                      {/* Badge de Nível Sobreposto */}
                      <div className="absolute -bottom-2 -right-2 text-4xl">{config.icone}</div>
                    </div>
                    <div>
                      <div className="text-white font-bold text-3xl mb-1">{userName}</div>
                      <div className="text-white/80 text-sm">
                        {boxNome} • {categoria}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6">
                    <div>
                      <div className="text-white/70 text-xs font-semibold uppercase">Nível</div>
                      <div className="text-white font-bold text-2xl">{config.nome}</div>
                    </div>
                    <div>
                      <div className="text-white/70 text-xs font-semibold uppercase">Pontos</div>
                      <div className="text-white font-bold text-2xl">
                        {pontosTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl">
                  <QRCodeSVG value={profileUrl} size={100} level="H" />
                  <div className="text-center text-xs text-gray-600 mt-2 font-semibold">
                    Ver Perfil
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between">
                <div className="text-white/60 text-xs">
                  Leaderboard de Níveis • {new Date().toLocaleDateString("pt-BR")}
                </div>
                <div className="text-white/60 text-xs font-mono">{profileUrl}</div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            {canShare && (
              <Button onClick={handleShare} disabled={isSharing} className="gap-2 flex-1 sm:flex-none">
                <Share2 className="w-4 h-4" />
                {isSharing ? "Compartilhando..." : "Compartilhar"}
              </Button>
            )}
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Baixar
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {canShare
              ? "Compartilhe diretamente no Instagram, WhatsApp ou Facebook! 📱"
              : "Baixe a imagem e compartilhe nas redes sociais! 📱"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
