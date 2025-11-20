import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { ScanLine, CheckCircle2, XCircle, Flame } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerQRCode() {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    user?: { name?: string | null };
    message?: string;
  } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);

  const checkinMutation = trpc.qrcode.checkin.useMutation({
    onSuccess: (data) => {
      setLastResult({
        success: true,
        user: data.user,
      });
      toast.success(`Check-in realizado: ${data.user.name}`);
      
      // Limpar resultado após 3 segundos
      setTimeout(() => {
        setLastResult(null);
      }, 3000);
    },
    onError: (error) => {
      setLastResult({
        success: false,
        message: error.message,
      });
      toast.error(error.message);
      
      // Limpar resultado após 3 segundos
      setTimeout(() => {
        setLastResult(null);
      }, 3000);
    },
  });

  useEffect(() => {
    // Inicializar câmera
    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length > 0) {
        // Preferir câmera traseira
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back'));
        setCameraId(backCamera?.id || cameras[0].id);
      }
    }).catch(err => {
      console.error("Erro ao obter câmeras:", err);
      toast.error("Não foi possível acessar a câmera");
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (cameraId && scanning) {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR Code detectado
          checkinMutation.mutate({ qrData: decodedText });
          
          // Pausar scanner temporariamente
          scanner.pause(true);
          setTimeout(() => {
            scanner.resume();
          }, 3000);
        },
        (errorMessage) => {
          // Erro de leitura (normal durante scan)
        }
      ).catch(err => {
        console.error("Erro ao iniciar scanner:", err);
        toast.error("Erro ao iniciar scanner");
        setScanning(false);
      });

      return () => {
        scanner.stop().catch(console.error);
      };
    }
  }, [cameraId, scanning]);

  const toggleScanner = () => {
    if (scanning && scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
      }).catch(console.error);
    } else {
      setScanning(true);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ScanLine className="w-8 h-8 text-primary" />
            Scanner de Check-in
          </h1>
          <p className="text-muted-foreground">
            Escaneie o QR Code dos atletas para registrar presença
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Scanner de QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área do Scanner */}
            <div className="relative">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-black"
                style={{ minHeight: scanning ? '400px' : '0px' }}
              />
              
              {!scanning && (
                <div className="bg-muted rounded-lg p-12 text-center">
                  <ScanLine className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Clique em "Iniciar Scanner" para começar
                  </p>
                </div>
              )}
            </div>

            {/* Botão de Controle */}
            <button
              onClick={toggleScanner}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              {scanning ? "Parar Scanner" : "Iniciar Scanner"}
            </button>

            {/* Resultado do Último Scan */}
            {lastResult && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  lastResult.success
                    ? "bg-green-50 border-green-500 dark:bg-green-950"
                    : "bg-red-50 border-red-500 dark:bg-red-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  {lastResult.success ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {lastResult.success ? "Check-in Realizado!" : "Erro"}
                    </p>
                    <p className="text-sm">
                      {lastResult.success
                        ? lastResult.user?.name
                        : lastResult.message}
                    </p>
                  </div>
                  {lastResult.success && (
                    <Flame className="w-6 h-6 text-orange-500" />
                  )}
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Instruções:</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Clique em "Iniciar Scanner" para ativar a câmera</li>
                <li>Posicione o QR Code do atleta na área de leitura</li>
                <li>O check-in será processado automaticamente</li>
                <li>Aguarde a confirmação antes de escanear o próximo</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
