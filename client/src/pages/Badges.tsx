import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Award } from "lucide-react";

export default function Badges() {
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-primary" />
            Minhas Badges
          </h1>
          <p className="text-muted-foreground">Conquistas desbloqueadas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBadges && userBadges.length > 0 ? (
            userBadges.map((ub) => (
              <Card key={ub.id} className="card-impacto">
                <CardContent className="pt-6 text-center">
                  <div className="text-6xl mb-4">{ub.badge?.icone || "🏅"}</div>
                  <h3 className="text-xl font-bold text-primary">{ub.badge?.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{ub.badge?.descricao}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-impacto col-span-full">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Nenhuma badge conquistada ainda.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
