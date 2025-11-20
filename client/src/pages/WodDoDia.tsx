import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Dumbbell, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function WodDoDia() {
  const { data: wodHoje, isLoading } = trpc.wods.getToday.useQuery();
  const checkinMutation = trpc.checkins.create.useMutation();
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckin = async () => {
    if (!wodHoje) return;
    try {
      await checkinMutation.mutateAsync({
        wodId: wodHoje.id,
        boxId: wodHoje.boxId,
      });
      setCheckedIn(true);
      toast.success("Check-in realizado! +10 pontos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer check-in");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-primary" />
            WOD do Dia
          </h1>
          <p className="text-muted-foreground">Treino de hoje</p>
        </div>

        {isLoading ? (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : wodHoje ? (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="text-3xl text-primary">{wodHoje.titulo}</CardTitle>
              <p className="text-muted-foreground">
                {wodHoje.tipo.toUpperCase()}
                {wodHoje.timeCap && ` • Time Cap: ${wodHoje.timeCap} min`}
                {wodHoje.duracao && ` • Duração: ${wodHoje.duracao} min`}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="whitespace-pre-wrap text-lg">{wodHoje.descricao}</div>
              
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleCheckin}
                  disabled={checkedIn || checkinMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {checkedIn ? "Check-in Feito!" : "Fazer Check-in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Nenhum WOD disponível para hoje. Entre em contato com seu box.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
