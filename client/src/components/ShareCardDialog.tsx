import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FIFACard } from "./FIFACard";
import { useFIFACard } from "@/hooks/useFIFACard";
import { Download, Share2, Copy, Instagram } from "lucide-react";

interface ShareCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "pr" | "badge" | "conquista";
  atletaNome: string;
  boxNome: string;
  categoria?: string;
  pontosTotais?: number;
  ranking?: number;
  
  // Para PRs
  movimento?: string;
  carga?: number;
  unidade?: string;
  dataRecorde?: string;
  
  // Para Badges
  badgeNome?: string;
  badgeIcone?: string;
  badgeDescricao?: string;
  
  // Para Conquistas
  conquistaNome?: string;
  conquistaDescricao?: string;
  progresso?: number;
  meta?: number;
}

export function ShareCardDialog({
  open,
  onOpenChange,
  type,
  atletaNome,
  boxNome,
  categoria,
  pontosTotais,
  ranking,
  movimento,
  carga,
  unidade,
  dataRecorde,
  badgeNome,
  badgeIcone,
  badgeDescricao,
  conquistaNome,
  conquistaDescricao,
  progresso,
  meta,
}: ShareCardDialogProps) {
  const { cardRef, baixarImagem, compartilharInstagram, copiarImagem } = useFIFACard();

  const getTitulo = () => {
    if (type === "pr") return "Compartilhar PR";
    if (type === "badge") return "Compartilhar Badge";
    return "Compartilhar Conquista";
  };

  const getDescricao = () => {
    if (type === "pr") return "Seu card de Personal Record está pronto para compartilhar!";
    if (type === "badge") return "Seu card de Badge está pronto para compartilhar!";
    return "Seu card de Conquista está pronto para compartilhar!";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitulo()}</DialogTitle>
          <DialogDescription>{getDescricao()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Preview */}
          <div className="flex justify-center bg-black/5 rounded-lg p-6">
            <div className="scale-75 origin-center">
              <FIFACard
                ref={cardRef}
                type={type}
                atletaNome={atletaNome}
                boxNome={boxNome}
                categoria={categoria}
                pontosTotais={pontosTotais}
                ranking={ranking}
                movimento={movimento}
                carga={carga}
                unidade={unidade}
                dataRecorde={dataRecorde}
                badgeNome={badgeNome}
                badgeIcone={badgeIcone}
                badgeDescricao={badgeDescricao}
                conquistaNome={conquistaNome}
                conquistaDescricao={conquistaDescricao}
                progresso={progresso}
                meta={meta}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={compartilharInstagram}
              className="gap-2"
              size="lg"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </Button>
            <Button
              onClick={copiarImagem}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Copy className="w-5 h-5" />
              Copiar
            </Button>
            <Button
              onClick={() => baixarImagem("impacto-card")}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Baixar
            </Button>
            <Button
              onClick={compartilharInstagram}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            💡 Dica: Use o botão "Instagram" para compartilhar diretamente, ou "Copiar" para colar no Instagram Stories!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
