import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, TrendingUp, Target, Award, Loader2 } from "lucide-react";

export default function RankingGlobal() {
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState<number>(anoAtual);
  const [categoria, setCategoria] = useState<string | undefined>(undefined);

  const { data: ranking, isLoading } = trpc.rankingGlobal.useQuery({
    ano,
    categoria: categoria as any,
    limit: 50,
  });

  const getPosicaoIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (posicao === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (posicao === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getPosicaoBadge = (posicao: number) => {
    if (posicao === 1) return "bg-yellow-500";
    if (posicao === 2) return "bg-gray-400";
    if (posicao === 3) return "bg-amber-600";
    return "bg-muted";
  };

  // Estatísticas gerais
  const totalAtletas = ranking?.length || 0;
  const totalPontos = ranking?.reduce((sum, r) => sum + r.totalPontos, 0) || 0;
  const totalCampeonatos = ranking?.reduce((sum, r) => sum + r.totalCampeonatos, 0) || 0;
  const mediaPontos = totalAtletas > 0 ? Math.round(totalPontos / totalAtletas) : 0;

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Ranking Global {ano}
            </h1>
            <p className="text-muted-foreground mt-2">
              Classificação consolidada de todos os campeonatos do ano
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={anoAtual.toString()}>{anoAtual}</SelectItem>
                <SelectItem value={(anoAtual - 1).toString()}>{anoAtual - 1}</SelectItem>
                <SelectItem value={(anoAtual - 2).toString()}>{anoAtual - 2}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoria || "todas"} onValueChange={(v) => setCategoria(v === "todas" ? undefined : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
                <SelectItem value="elite">Elite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                Total de Atletas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAtletas}</div>
              <p className="text-xs text-muted-foreground mt-1">Competindo em {ano}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Total de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPontos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Acumulados no ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Campeonatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampeonatos}</div>
              <p className="text-xs text-muted-foreground mt-1">Participações totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Média de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaPontos}</div>
              <p className="text-xs text-muted-foreground mt-1">Por atleta</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação Geral</CardTitle>
            <CardDescription>
              Top 50 atletas com maior pontuação acumulada em {ano}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !ranking || ranking.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum atleta encontrado para os filtros selecionados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos.</TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Campeonatos</TableHead>
                    <TableHead className="text-right">Total Pontos</TableHead>
                    <TableHead className="text-right">Média</TableHead>
                    <TableHead className="text-center">Melhor Pos.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((atleta) => (
                    <TableRow key={atleta.userId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPosicaoIcon(atleta.posicao)}
                          <Badge className={getPosicaoBadge(atleta.posicao)}>
                            {atleta.posicao}º
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{atleta.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {atleta.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{atleta.totalCampeonatos}</TableCell>
                      <TableCell className="text-right font-bold">
                        {atleta.totalPontos.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {atleta.mediaPontos}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{atleta.melhorPosicao}º</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
