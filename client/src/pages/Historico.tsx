import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { History } from "lucide-react";

export default function Historico() {
  const { data: checkins } = trpc.checkins.getByUser.useQuery({ limit: 30 });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <History className="w-10 h-10 text-primary" />
            Histórico de Treinos
          </h1>
          <p className="text-muted-foreground">Seus últimos treinos</p>
        </div>

        <div className="space-y-4">
          {checkins && checkins.length > 0 ? (
            checkins.map((checkin) => (
              <Card key={checkin.id} className="card-impacto">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    {new Date(checkin.dataHora).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-lg font-bold">Check-in realizado</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-impacto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Nenhum treino registrado ainda.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
