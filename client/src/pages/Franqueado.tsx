import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Franqueado() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: metrics, isLoading: metricsLoading } = trpc.franqueado.getMetrics.useQuery();
  const { data: boxes, isLoading: boxesLoading } = trpc.franqueado.getMyBoxes.useQuery();

  useEffect(() => {
    if (!loading && user?.role !== "franqueado") {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading || metricsLoading || boxesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gradient-impacto mb-2">
          Painel do Franqueado
        </h1>
        <p className="text-muted-foreground">
          Visão consolidada de todos os seus boxes
        </p>
      </div>

      {/* Métricas Consolidadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Boxes</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics?.totalBoxes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unidades franqueadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics?.totalAlunos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atletas cadastrados
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boxes Ativos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{metrics?.totalAtivos || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em operação
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Alunos</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {metrics?.totalBoxes && metrics.totalBoxes > 0 
                ? Math.round((metrics.totalAlunos || 0) / metrics.totalBoxes)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por box
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Boxes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Seus Boxes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boxes && boxes.length > 0 ? (
            boxes.map((box) => (
              <Card key={box.id} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{box.nome}</CardTitle>
                      <CardDescription>
                        {box.cidade}, {box.estado}
                      </CardDescription>
                    </div>
                    {box.ativo ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-500">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-500">
                        Inativo
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium capitalize">{box.tipo}</span>
                    </div>
                    {box.endereco && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço:</span>
                        <span className="font-medium text-right">{box.endereco}</span>
                      </div>
                    )}
                    {box.dataAdesao && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Adesão:</span>
                        <span className="font-medium">
                          {new Date(box.dataAdesao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum box vinculado à sua franquia ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
