import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Calendar } from "lucide-react";

export default function Campeonatos() {
  const { data: campeonatos } = trpc.campeonatos.getAbertos.useQuery();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-primary" />
            Campeonatos
          </h1>
          <p className="text-muted-foreground">Eventos disponíveis</p>
        </div>

        <div className="space-y-4">
          {campeonatos && campeonatos.length > 0 ? (
            campeonatos.map((camp) => (
              <Card key={camp.id} className="card-impacto">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{camp.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{camp.tipo.toUpperCase()}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {new Date(camp.dataInicio).toLocaleDateString("pt-BR")} até{" "}
                    {new Date(camp.dataFim).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-impacto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Nenhum campeonato disponível no momento.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
