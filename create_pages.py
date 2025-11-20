#!/usr/bin/env python3

pages = {
    "WodDoDia.tsx": """import AppLayout from "@/components/AppLayout";
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
""",

    "Historico.tsx": """import AppLayout from "@/components/AppLayout";
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
""",

    "PRs.tsx": """import AppLayout from "@/components/AppLayout";
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
""",

    "Rankings.tsx": """import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Rankings() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Rankings
          </h1>
          <p className="text-muted-foreground">Sua posição nos rankings</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Rankings em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
""",

    "Badges.tsx": """import AppLayout from "@/components/AppLayout";
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
""",

    "Campeonatos.tsx": """import AppLayout from "@/components/AppLayout";
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
""",

    "Perfil.tsx": """import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { User } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">Suas informações</p>
        </div>

        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-bold">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perfil</p>
              <p className="text-lg capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
""",

    "GestaoBox.tsx": """import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function GestaoBox() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Gestão do Box
          </h1>
          <p className="text-muted-foreground">Gerencie seu box</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Funcionalidades de gestão em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
""",

    "AdminLiga.tsx": """import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminLiga() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Admin da Liga
          </h1>
          <p className="text-muted-foreground">Administração da Impacto Pro League</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Painel administrativo em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
""",
}

import os

pages_dir = "/home/ubuntu/impacto-pro-league/client/src/pages"

for filename, content in pages.items():
    filepath = os.path.join(pages_dir, filename)
    with open(filepath, "w") as f:
        f.write(content)
    print(f"✓ Created {filename}")

print(f"\n✅ All {len(pages)} pages created successfully!")
