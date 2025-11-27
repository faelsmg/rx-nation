import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Share2, Copy, MessageCircle, Send, RotateCcw, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ShareBoxButtonProps {
  boxSlug: string;
  boxName: string;
  boxId: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareBoxButton({ boxSlug, boxName, boxId, variant = "default", size = "default" }: ShareBoxButtonProps) {
  const [open, setOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const joinLink = `${window.location.origin}/join/${boxSlug}`;
  
  const defaultMessage = `🏋️ Junte-se ao ${boxName}!\n\nFaça parte da nossa comunidade CrossFit e alcance seus objetivos!\n\n👉 ${joinLink}`;

  // Buscar template salvo
  const { data: box } = trpc.boxes.getById.useQuery({ id: boxId }, { enabled: open });
  
  // Mutation para salvar template
  const saveTemplateMutation = trpc.boxes.saveInviteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template salvo com sucesso!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Erro ao salvar template");
    }
  });

  // Carregar template salvo ou usar padrão
  useEffect(() => {
    if (box?.mensagemConvite) {
      setCustomMessage(box.mensagemConvite);
    } else {
      setCustomMessage(defaultMessage);
    }
  }, [box, defaultMessage]);

  const handleSaveTemplate = () => {
    saveTemplateMutation.mutate({
      boxId,
      mensagemConvite: customMessage
    });
  };

  const handleResetTemplate = () => {
    setCustomMessage(defaultMessage);
    toast.info("Template resetado para padrão");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast.success("Link copiado!");
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(joinLink)}&text=${encodeURIComponent(`🏋️ Junte-se ao ${boxName}!`)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar {boxName}</DialogTitle>
          <DialogDescription>
            Convide atletas para se juntarem ao seu box
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Link para copiar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link de Convite</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={joinLink}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mensagem editável */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mensagem de Convite</label>
              <div className="flex gap-1">
                {isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetTemplate}
                      disabled={saveTemplateMutation.isPending}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Resetar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={saveTemplateMutation.isPending}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </div>
            </div>
            
            {isEditing ? (
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                placeholder="Digite sua mensagem personalizada..."
              />
            ) : (
              <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
                {customMessage}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              💡 Dica: Use {"{link}"} no texto e ele será substituído automaticamente pelo link
            </p>
          </div>

          {/* Botões de compartilhamento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Compartilhar via</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareWhatsApp}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareTelegram}
              >
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
