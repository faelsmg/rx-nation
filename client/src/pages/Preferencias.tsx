import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Bell, Dumbbell, MessageSquare, Calendar, Award } from "lucide-react";
import { toast } from "sonner";

export default function Preferencias() {
  const utils = trpc.useUtils();
  const { data: preferences, isLoading } = trpc.preferences.get.useQuery();

  const updateMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Preferências atualizadas!");
      utils.preferences.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar preferências");
    },
  });

  const handleToggle = (key: "wods" | "comunicados" | "lembretes" | "badges", value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Preferências</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas preferências de notificações
            </p>
          </div>

          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>
                Escolha quais tipos de notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WODs */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="wods" className="text-base font-medium cursor-pointer">
                      WODs do Dia
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando novos WODs forem publicados
                    </p>
                  </div>
                </div>
                <Switch
                  id="wods"
                  checked={preferences?.wods ?? true}
                  onCheckedChange={(checked) => handleToggle("wods", checked)}
                  disabled={updateMutation.isPending}
                />
              </div>

              {/* Comunicados */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <Label htmlFor="comunicados" className="text-base font-medium cursor-pointer">
                      Comunicados
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba avisos e comunicados importantes do box
                    </p>
                  </div>
                </div>
                <Switch
                  id="comunicados"
                  checked={preferences?.comunicados ?? true}
                  onCheckedChange={(checked) => handleToggle("comunicados", checked)}
                  disabled={updateMutation.isPending}
                />
              </div>

              {/* Lembretes de Aulas */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label htmlFor="lembretes" className="text-base font-medium cursor-pointer">
                      Lembretes de Aulas
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes 1 hora antes das aulas reservadas
                    </p>
                  </div>
                </div>
                <Switch
                  id="lembretes"
                  checked={preferences?.lembretes ?? true}
                  onCheckedChange={(checked) => handleToggle("lembretes", checked)}
                  disabled={updateMutation.isPending}
                />
              </div>

              {/* Badges */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <Label htmlFor="badges" className="text-base font-medium cursor-pointer">
                      Badges Desbloqueados
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações quando conquistar novos badges
                    </p>
                  </div>
                </div>
                <Switch
                  id="badges"
                  checked={preferences?.badges ?? true}
                  onCheckedChange={(checked) => handleToggle("badges", checked)}
                  disabled={updateMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            Você pode alterar essas preferências a qualquer momento
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
