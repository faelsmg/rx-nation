import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { QrCode, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeuQRCode() {
  const { data, isLoading } = trpc.qrcode.generate.useQuery();

  const handleDownload = () => {
    if (!data?.qrCode) return;

    const link = document.createElement("a");
    link.href = data.qrCode;
    link.download = `qrcode-${data.userName || 'atleta'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <QrCode className="w-8 h-8 text-primary" />
            Meu QR Code
          </h1>
          <p className="text-muted-foreground">
            Use este QR Code para fazer check-in rápido na recepção do box
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QR Code de Check-in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : data?.qrCode ? (
              <>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <img
                    src={data.qrCode}
                    alt="QR Code de Check-in"
                    className="w-64 h-64"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="font-semibold text-lg">{data.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    Apresente este código na recepção para registrar sua presença
                  </p>
                </div>

                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar QR Code
                </Button>

                <div className="w-full pt-4 border-t">
                  <h3 className="font-semibold mb-2">Como usar:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Mostre este QR Code na recepção do box</li>
                    <li>O atendente irá escanear com o tablet/celular</li>
                    <li>Seu check-in será registrado automaticamente</li>
                    <li>Você ganhará pontos e manterá seu streak ativo</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                Erro ao gerar QR Code
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
