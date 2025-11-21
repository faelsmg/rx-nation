import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import { Bell, BellOff, Check } from "lucide-react";

export function NotificationPermissionButton() {
  const { permission, supported, requestPermission, isGranted } = useNotificationPermission();

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações não suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações web
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isGranted) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Notificações Ativadas
          </CardTitle>
          <CardDescription>
            Você receberá notificações quando conquistar badges, subir de nível ou receber novos desafios
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Ativar Notificações
        </CardTitle>
        <CardDescription>
          Receba notificações instantâneas sobre suas conquistas e desafios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={requestPermission} className="w-full" size="lg">
          <Bell className="h-5 w-5 mr-2" />
          Ativar Notificações
        </Button>
        {permission === "denied" && (
          <p className="text-sm text-destructive mt-3">
            Você negou as permissões. Para ativar, vá nas configurações do navegador e permita notificações para este site.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
