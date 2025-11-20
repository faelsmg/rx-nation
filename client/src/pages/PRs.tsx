import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp } from "lucide-react";

export default function PRs() {
  const { data: prs } = trpc.prs.getByUser.useQuery();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Meus PRs
          </h1>
          <p className="text-muted-foreground">Personal Records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prs && prs.length > 0 ? (
            prs.map((pr) => (
              <Card key={pr.id} className="card-impacto">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-primary">{pr.movimento}</h3>
                  <p className="text-3xl font-bold mt-2">{pr.carga} kg</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(pr.data).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-impacto col-span-full">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Nenhum PR registrado ainda.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
