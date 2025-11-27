import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Medal, Award } from "lucide-react";
import { useState } from "react";
import { MOVIMENTOS_PR, CATEGORIAS, FAIXAS_ETARIAS } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar } from "@/components/Avatar";

export default function Rankings() {
  const { user } = useAuth();
  const [movimento, setMovimento] = useState(MOVIMENTOS_PR[0] || "Back Squat");
  const [categoria, setCategoria] = useState<string>("todas");
  const [faixaEtaria, setFaixaEtaria] = useState<string>("todas");

  const { data: ranking, isLoading } = trpc.prs.getRankingByMovimento.useQuery({
    movimento,
    categoria: categoria === "todas" ? undefined : categoria,
    faixaEtaria: faixaEtaria === "todas" ? undefined : faixaEtaria,
  });

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const userPosition = ranking?.findIndex((r: any) => r.pr.userId === user?.id);
  const userRank = userPosition !== undefined && userPosition >= 0 ? userPosition + 1 : null;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Rankings
          </h1>
          <p className="text-muted-foreground">Compare seu desempenho com outros atletas</p>
        </div>

        {/* Filtros */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Movimento</label>
                <Select value={movimento} onValueChange={setMovimento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVIMENTOS_PR.map((mov) => (
                      <SelectItem key={mov} value={mov}>
                        {mov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {CATEGORIAS.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Faixa Etária</label>
                <Select value={faixaEtaria} onValueChange={setFaixaEtaria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {FAIXAS_ETARIAS.map((fx: string) => (
                      <SelectItem key={fx} value={fx}>
                        {fx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sua Posição */}
        {userRank && (
          <Card className="card-impacto bg-primary/10 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sua Posição</p>
                  <p className="text-3xl font-bold text-primary">#{userRank}</p>
                </div>
                {ranking && ranking[userPosition!] && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Seu PR</p>
                    <p className="text-2xl font-bold">{ranking[userPosition!].pr.carga} kg</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Top 50 - {movimento}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : ranking && ranking.length > 0 ? (
              <div className="space-y-2">
                {ranking.slice(0, 50).map((entry: any, index: number) => {
                  const position = index + 1;
                  const isCurrentUser = entry.pr.userId === user?.id;
                  
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentUser
                          ? "bg-primary/10 border-primary"
                          : "bg-card hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 text-center">
                          {getMedalIcon(position) || (
                            <span className="text-lg font-bold text-muted-foreground">
                              #{position}
                            </span>
                          )}
                        </div>
                        <Avatar
                          src={entry.user.avatar_url}
                          alt={entry.user.name || "Atleta"}
                          fallback={entry.user.name}
                          size="md"
                        />
                        <div>
                          <p className={`font-semibold ${isCurrentUser ? "text-primary" : ""}`}>
                            {entry.user.name || "Atleta"}
                            {isCurrentUser && " (Você)"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.user.categoria || "N/A"} • {entry.user.faixaEtaria || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{entry.pr.carga} kg</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.pr.data).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhum PR registrado para este movimento ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
