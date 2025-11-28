import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, ArrowRight, AlertCircle, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function MetasWidget() {
  const { data: metasAtivas, isLoading } = trpc.metasPRs.getAtivas.useQuery();
  const { data: estatisticas } = trpc.metasPRs.getEstatisticas.useQuery();

  // Calcular progresso médio
  const progressoMedio = metasAtivas && metasAtivas.length > 0
    ? Math.round(metasAtivas.reduce((acc, meta) => acc + meta.progresso, 0) / metasAtivas.length)
    : 0;

  // Filtrar metas por urgência
  const metasUrgentes = metasAtivas?.filter(
    (meta) => meta.diasRestantes !== null && meta.diasRestantes >= 0 && meta.diasRestantes <= 7 && !meta.atingida
  ) || [];

  const metasExpiradas = metasAtivas?.filter(
    (meta) => meta.diasRestantes !== null && meta.diasRestantes < 0 && !meta.atingida
  ) || [];

  const metasAtingidas = metasAtivas?.filter((meta) => meta.atingida) || [];

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return "bg-green-500";
    if (progresso >= 75) return "bg-blue-500";
    if (progresso >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getUrgencyBadge = (meta: any) => {
    if (meta.atingida) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Atingida
        </Badge>
      );
    }

    if (meta.diasRestantes !== null) {
      if (meta.diasRestantes < 0) {
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expirada
          </Badge>
        );
      } else if (meta.diasRestantes <= 3) {
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            {meta.diasRestantes}d
          </Badge>
        );
      } else if (meta.diasRestantes <= 7) {
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {meta.diasRestantes}d
          </Badge>
        );
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-gray-800" />
          <Skeleton className="h-4 w-48 bg-gray-800 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 bg-gray-800" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!metasAtivas || metasAtivas.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-500" />
            Metas de PRs
          </CardTitle>
          <CardDescription>Defina metas e acompanhe seu progresso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">Você ainda não tem metas ativas</p>
            <Link href="/metas-prs">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Criar Meta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-500" />
              Metas de PRs
            </CardTitle>
            <CardDescription>
              {metasAtivas.length} {metasAtivas.length === 1 ? "meta ativa" : "metas ativas"}
            </CardDescription>
          </div>
          <Link href="/metas-prs">
            <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Ativas</p>
            <p className="text-lg font-bold text-yellow-500">{estatisticas?.ativas || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Progresso Médio</p>
            <p className="text-lg font-bold text-blue-400">{progressoMedio}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Concluídas</p>
            <p className="text-lg font-bold text-green-400">{estatisticas?.concluidas || 0}</p>
          </div>
        </div>

        {/* Alertas de Urgência */}
        {metasExpiradas.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">
                {metasExpiradas.length} {metasExpiradas.length === 1 ? "meta expirada" : "metas expiradas"}
              </p>
              <p className="text-xs text-red-300/70">Revise e atualize suas metas</p>
            </div>
          </div>
        )}

        {metasUrgentes.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-400">
                {metasUrgentes.length} {metasUrgentes.length === 1 ? "meta próxima" : "metas próximas"} do prazo
              </p>
              <p className="text-xs text-yellow-300/70">Foque nestas metas esta semana</p>
            </div>
          </div>
        )}

        {metasAtingidas.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-400">
                {metasAtingidas.length} {metasAtingidas.length === 1 ? "meta atingida" : "metas atingidas"}!
              </p>
              <p className="text-xs text-green-300/70">Parabéns pelo progresso! 🎉</p>
            </div>
          </div>
        )}

        {/* Lista de Metas (máximo 3) */}
        <div className="space-y-3">
          {metasAtivas.slice(0, 3).map((meta) => (
            <div key={meta.id} className="p-3 bg-gray-800/50 rounded-lg space-y-2 hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{meta.movimento}</p>
                  <p className="text-xs text-gray-400">
                    {meta.cargaAtualReal}kg → {meta.cargaMeta}kg
                  </p>
                </div>
                {getUrgencyBadge(meta)}
              </div>

              {/* Mini Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progresso</span>
                  <span className="font-medium text-white">{meta.progresso}%</span>
                </div>
                <div className="relative">
                  <Progress value={meta.progresso} className="h-2 bg-gray-700">
                    <div
                      className={`h-full ${getProgressColor(meta.progresso)} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(meta.progresso, 100)}%` }}
                    />
                  </Progress>
                </div>
              </div>

              {/* Informações Adicionais */}
              {meta.diasRestantes !== null && meta.diasRestantes >= 0 && !meta.atingida && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{meta.diasRestantes} dias restantes</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botão Ver Todas (se houver mais de 3) */}
        {metasAtivas.length > 3 && (
          <Link href="/metas-prs">
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Ver Todas as {metasAtivas.length} Metas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
