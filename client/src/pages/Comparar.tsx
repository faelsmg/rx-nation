import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Award, Dumbbell, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Comparar() {
  const { user } = useAuth();
  const [userId1, setUserId1] = useState<number | null>(null);
  const [userId2, setUserId2] = useState<number | null>(null);

  const { data: atletas } = trpc.user.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const { data: comparacao, isLoading } = trpc.comparacao.compareAtletas.useQuery(
    { userId1: userId1!, userId2: userId2! },
    { enabled: !!userId1 && !!userId2 }
  );

  const handleComparar = () => {
    if (!userId1 || !userId2) {
      return;
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comparar Atletas</h1>
          <p className="text-muted-foreground">
            Compare PRs, badges e estatísticas lado a lado
          </p>
        </div>

        {/* Seletores */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Atleta 1</label>
                <Select
                  value={userId1?.toString()}
                  onValueChange={(value) => setUserId1(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    {atletas?.map((atleta) => (
                      <SelectItem key={atleta.id} value={atleta.id.toString()}>
                        {atleta.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Atleta 2</label>
                <Select
                  value={userId2?.toString()}
                  onValueChange={(value) => setUserId2(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um atleta" />
                  </SelectTrigger>
                  <SelectContent>
                    {atletas
                      ?.filter((a) => a.id !== userId1)
                      .map((atleta) => (
                        <SelectItem key={atleta.id} value={atleta.id.toString()}>
                          {atleta.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados da Comparação */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          </div>
        )}

        {comparacao && (
          <div className="space-y-6">
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Atleta 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">{comparacao.atleta1.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-500" />
                      <span>WODs Completados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta1.totalWods}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      <span>PRs Registrados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta1.totalPRs}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>Badges Conquistados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta1.totalBadges}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Pontos Totais</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta1.pontos}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Atleta 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">{comparacao.atleta2.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-blue-500" />
                      <span>WODs Completados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta2.totalWods}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      <span>PRs Registrados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta2.totalPRs}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span>Badges Conquistados</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta2.totalBadges}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span>Pontos Totais</span>
                    </div>
                    <span className="font-bold text-lg">{comparacao.atleta2.pontos}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PRs Lado a Lado */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação de PRs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">{comparacao.atleta1.name}</h3>
                    <div className="space-y-2">
                      {comparacao.atleta1.prs.slice(0, 5).map((pr) => (
                        <div key={pr.id} className="flex justify-between p-2 bg-muted rounded">
                          <span>{pr.movimento}</span>
                          <span className="font-bold">{pr.carga} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">{comparacao.atleta2.name}</h3>
                    <div className="space-y-2">
                      {comparacao.atleta2.prs.slice(0, 5).map((pr) => (
                        <div key={pr.id} className="flex justify-between p-2 bg-muted rounded">
                          <span>{pr.movimento}</span>
                          <span className="font-bold">{pr.carga} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!userId1 || !userId2 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Selecione dois atletas para comparar</p>
              <p className="text-sm">
                Compare PRs, badges e estatísticas lado a lado
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
