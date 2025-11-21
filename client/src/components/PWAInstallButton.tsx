import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePWA } from "@/hooks/usePWA";
import { Download, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const [showDialog, setShowDialog] = useState(false);

  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success("App instalado com sucesso! 🎉");
      setShowDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Instalar App</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Instalar RX Nation
            </DialogTitle>
            <DialogDescription>
              Instale o app no seu dispositivo para acesso rápido e experiência nativa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Benefícios do App:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Acesso rápido direto da tela inicial</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Funciona offline (visualizar dados salvos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Notificações de WODs, badges e eventos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Experiência nativa sem navegador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Ocupa menos espaço que apps tradicionais</span>
                </li>
              </ul>
            </div>

            {!isOnline && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
                <WifiOff className="w-4 h-4" />
                <span>Você está offline. Conecte-se para instalar o app.</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Agora não
              </Button>
              <Button
                onClick={handleInstall}
                disabled={!isOnline}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              O app será instalado no seu dispositivo e poderá ser acessado da tela inicial
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PWAOfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-500/90 text-yellow-950 px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
}
