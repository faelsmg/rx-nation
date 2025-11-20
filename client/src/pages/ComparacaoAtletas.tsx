import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Users, Trophy, TrendingUp, Award, Activity } from "lucide-react";
import { toast } from "sonner";

export default function ComparacaoAtletas() {
  const [atletasSelecionados, setAtletasSelecionados] = useState<number[]>([]);

  const { data: atletasBox } = trpc.comparacao.getAtletasBox.useQuery();
  
  const { data: comparacao, isLoading } = trpc.comparacao.getComparacao.useQuery(
    { atletasIds: atletasSelecionados },
    { enabled: atletasSelecionados.length >= 2 }
  );

  const { data: prs } = trpc.comparacao.getPRs.useQuery(
    { atletasIds: atletasSelecionados },
    { enabled: atletasSelecionados.length >= 2 }
  );

  const { data: badges } = trpc.comparacao.getBadges.useQuery(
    { atletasIds: atletasSelecionados },
    { enabled: atletasSelecionados.length >= 2 }
  );

  const handleAddAtleta = (atletaId: string) => {
    const id = parseInt(atletaId);
    if (atletasSelecionados.includes(id)) {
      toast.error("Atleta já selecionado");
      return;
    }
    if (atletasSelecionados.length >= 4) {
      toast.error("Máximo de 4 atletas para comparação");
      return;
    }
    setAtletasSelecionados([...atletasSelecionados, id]);
  };

  const handleRemoveAtleta = (atletaId: number) => {
    setAtletasSelecionados(atletasSelecionados.filter(id => id !== atletaId));
  };

  // Agrupar PRs por movimento
  const prsPorMovimento = useMemo(() => {
    if (!prs) return {};
    
    const grupos: Record<string, any[]> = {};
    prs.forEach((pr: any) => {
      if (!grupos[pr.movimento]) {
        grupos[pr.movimento] = [];
      }
      grupos[pr.movimento].push(pr);
    });
    return grupos;
  }, [prs]);

  // Agrupar badges por atleta
  const badgesPorAtleta = useMemo(() => {
    if (!badges) return {};
    
    const grupos: Record<number, any[]> = {};
    badges.forEach((badge: any) => {
      if (!grupos[badge.user_id]) {
        grupos[badge.user_id] = [];
      }
      grupos[badge.user_id].push(badge);
    });
    return grupos;
  }, [badges]);

  return (
    <AppLayout>
      <div className="container max-w-7xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Comparação entre Atletas
          </h1>
          <p className="text-muted-foreground">
            Compare PRs, frequência e badges de até 4 atletas
          </p>
        </div>

        {/* Seletor de Atletas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Atletas ({atletasSelecionados.length}/4)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {comparacao?.map((atleta: any) => (
                <div
                  key={atleta.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary"
                >
                  <span className="font-semibold">{atleta.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAtleta(atleta.id)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            {atletasSelecionados.length < 4 && (
              <Select onValueChange={handleAddAtleta}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar atleta..." />
                </SelectTrigger>
                <SelectContent>
                  {atletasBox
                    ?.filter((a: any) => !atletasSelecionados.includes(a.id))
                    .map((atleta: any) => (
                      <SelectItem key={atleta.id} value={atleta.id.toString()}>
                        {atleta.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {atletasSelecionados.length < 2 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Selecione pelo menos 2 atletas para comparar
            </CardContent>
          </Card>
        )}

        {atletasSelecionados.length >= 2 && (
          <>
            {/* Estatísticas Gerais */}
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg mb-6" />
              </div>
            ) : comparacao ? (
              <div className="grid gap-6 mb-6">
                {/* Cards de Estatísticas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Estatísticas Gerais (Últimos 30 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Atleta</th>
                            <th className="text-center p-3">Check-ins</th>
                            <th className="text-center p-3">WODs</th>
                            <th className="text-center p-3">PRs Total</th>
                            <th className="text-center p-3">Pontos</th>
                            <th className="text-center p-3">Badges</th>
                            <th className="text-center p-3">Streak</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparacao.map((atleta: any) => (
                            <tr key={atleta.id} className="border-b hover:bg-muted/50">
                              <td className="p-3 font-semibold">{atleta.name}</td>
                              <td className="text-center p-3">{atleta.total_checkins_30d}</td>
                              <td className="text-center p-3">{atleta.wods_completados_30d}</td>
                              <td className="text-center p-3">{atleta.total_prs}</td>
                              <td className="text-center p-3 font-bold text-primary">
                                {atleta.pontos_30d}
                              </td>
                              <td className="text-center p-3">{atleta.total_badges}</td>
                              <td className="text-center p-3">
                                {atleta.streak_atual > 0 && (
                                  <span className="text-orange-500">
                                    🔥 {atleta.streak_atual}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparação de PRs */}
                {Object.keys(prsPorMovimento).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Comparação de PRs por Movimento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {Object.entries(prsPorMovimento).map(([movimento, prsMovimento]: [string, any]) => {
                          const maxCarga = Math.max(...prsMovimento.map((p: any) => p.melhor_carga));
                          
                          return (
                            <div key={movimento}>
                              <h3 className="font-semibold mb-3">{movimento}</h3>
                              <div className="space-y-2">
                                {prsMovimento.map((pr: any) => {
                                  const atleta = comparacao.find((a: any) => a.id === pr.user_id);
                                  const porcentagem = (pr.melhor_carga / maxCarga) * 100;
                                  const isMax = pr.melhor_carga === maxCarga;

                                  return (
                                    <div key={pr.user_id}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                          {atleta?.name}
                                        </span>
                                        <span className={`text-sm font-bold ${
                                          isMax ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                          {pr.melhor_carga}kg
                                          {isMax && ' 👑'}
                                        </span>
                                      </div>
                                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${
                                            isMax 
                                              ? 'bg-gradient-to-r from-primary to-primary/60' 
                                              : 'bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30'
                                          }`}
                                          style={{ width: `${porcentagem}%` }}
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {pr.total_tentativas} tentativas • Último: {
                                          new Date(pr.data_ultimo_pr).toLocaleDateString('pt-BR')
                                        }
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comparação de Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Badges Conquistados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {comparacao.map((atleta: any) => {
                        const atletaBadges = badgesPorAtleta[atleta.id] || [];

                        return (
                          <div key={atleta.id} className="p-4 rounded-lg bg-muted">
                            <h3 className="font-semibold mb-3">{atleta.name}</h3>
                            {atletaBadges.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {atletaBadges.map((badge: any) => (
                                  <div
                                    key={badge.badge_id}
                                    className="text-2xl"
                                    title={badge.nome}
                                  >
                                    {badge.icone}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhum badge</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Total: {atletaBadges.length} badges
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  );
}
