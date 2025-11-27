import { useState } from "react";
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
import { toast } from "sonner";
import { Share2, Copy, MessageCircle, Send } from "lucide-react";

interface ShareBoxButtonProps {
  boxSlug: string;
  boxName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareBoxButton({ boxSlug, boxName, variant = "default", size = "default" }: ShareBoxButtonProps) {
  const [open, setOpen] = useState(false);
  
  const joinLink = `${window.location.origin}/join/${boxSlug}`;
  
  const shareMessage = `🏋️ Junte-se ao ${boxName}!\n\nFaça parte da nossa comunidade CrossFit e alcance seus objetivos!\n\n👉 ${joinLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast.success("Link copiado!");
  };

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
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

          {/* Preview da mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem</label>
            <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
              {shareMessage}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
