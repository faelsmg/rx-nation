import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, DollarSign, Trophy, Medal, CheckCircle2, XCircle, Clock, Settings } from "lucide-react";
import GestaoBaterias from "@/components/GestaoBaterias";
import ConfiguracaoPontuacao from "@/components/ConfiguracaoPontuacao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";

export default function CampeonatoDetalhes() {
  const [, params] = useRoute("/campeonatos/:id");
  const campeonatoId = parseInt(params?.id || "0");
  const { user, isAuthenticated } = useAuth();

  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>(undefined);
  const [faixaEtariaFiltro, setFaixaEtariaFiltro] = useState<string | undefined>(undefined);

  const utils = trpc.useUtils();

  // Queries
  const { data: campeonato, isLoading } = trpc.campeonatos.getById.useQuery({ id: campeonatoId });
  const { data: inscricoes } = trpc.campeonatos.listInscricoes.useQuery(
    { campeonatoId },
    { enabled: !!campeonato }
  );
  const { data: minhaBateria } = trpc.baterias.minhaBateria.useQuery(
    { campeonatoId },
    { enabled: !!user && user.role === 'atleta' }
  );

  const { data: leaderboard } = trpc.campeonatos.leaderboard.useQuery(
    {
      campeonatoId,
      categoria: categoriaFiltro as any,
      faixaEtaria: faixaEtariaFiltro,
    },
    { enabled: !!campeonato }
  );
  const { data: minhasInscricoes } = trpc.campeonatos.minhasInscricoes.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "atleta" }
  );

  // Mutations
  const inscreverMutation = trpc.campeonatos.inscrever.useMutation({
    onSuccess: () => {
      toast.success("Inscrição realizada com sucesso!");
      utils.campeonatos.minhasInscricoes.invalidate();
      utils.campeonatos.listInscricoes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar inscrição");
    },
  });

  const cancelarMutation = trpc.campeonatos.cancelarInscricao.useMutation({
    onSuccess: () => {
      toast.success("Inscrição cancelada com sucesso!");
      utils.campeonatos.minhasInscricoes.invalidate();
      utils.campeonatos.listInscricoes.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar inscrição");
    },
  });

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      interno: "Interno",
      cidade: "Cidade",
      regional: "Regional",
      estadual: "Estadual",
      nacional: "Nacional",
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      interno: "bg-blue-500",
      cidade: "bg-green-500",
      regional: "bg-yellow-500",
      estadual: "bg-orange-500",
      nacional: "bg-red-500",
    };
    return colors[tipo] || "bg-gray-500";
  };

  const isInscrito = () => {
    return minhasInscricoes?.some((insc: any) => insc.campeonatoId === campeonatoId);
  };

  const getMinhaInscricao = () => {
    return minhasInscricoes?.find((insc: any) => insc.campeonatoId === campeonatoId);
  };

  const handleInscrever = () => {
    inscreverMutation.mutate({ campeonatoId });
  };

  const handleCancelar = () => {
    const inscricao = getMinhaInscricao();
    if (inscricao && confirm("Tem certeza que deseja cancelar sua inscrição?")) {
      cancelarMutation.mutate({ inscricaoId: inscricao.id });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!campeonato) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-muted-foreground">Campeonato não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <Card className="card-impacto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getTipoColor(campeonato.tipo)}>
                    {getTipoLabel(campeonato.tipo)}
                  </Badge>
                  {campeonato.inscricoesAbertas ? (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Inscrições Abertas
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inscrições Fechadas</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{campeonato.nome}</CardTitle>
                {campeonato.descricao && (
                  <CardDescription className="text-base">{campeonato.descricao}</CardDescription>
                )}
              </div>

              {/* Botão de Inscrição */}
              {isAuthenticated && user?.role === "atleta" && (
                <div className="ml-4">
                  {isInscrito() ? (
                    <Button
                      variant="destructive"
                      onClick={handleCancelar}
                      disabled={cancelarMutation.isPending}
                    >
                      Cancelar Inscrição
                    </Button>
                  ) : campeonato.inscricoesAbertas ? (
                    <Button
                      onClick={handleInscrever}
                      disabled={inscreverMutation.isPending}
                    >
                      Inscrever-se
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">
                    {format(new Date(campeonato.dataInicio), "dd/MM/yy", { locale: ptBR })} -{" "}
                    {format(new Date(campeonato.dataFim), "dd/MM/yy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {campeonato.local && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{campeonato.local}</p>
                  </div>
                </div>
              )}

              {campeonato.capacidade && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">
                      {inscricoes?.length || 0} / {campeonato.capacidade} inscritos
                    </p>
                  </div>
                </div>
              )}

              {campeonato.valorInscricao > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor</p>
                    <p className="font-medium">R$ {(campeonato.valorInscricao / 100).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Minha Bateria (Atleta) */}
        {user?.role === 'atleta' && minhaBateria && (
          <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Sua Bateria
              </CardTitle>
              <CardDescription>
                Você foi alocado em uma bateria!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{minhaBateria.bateriaNome || `Bateria ${minhaBateria.bateriaNumero}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {format(new Date(minhaBateria.bateriaHorario), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {minhaBateria.posicao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Posição/Lane</p>
                    <p className="font-medium">{minhaBateria.posicao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className={`grid w-full ${user?.role === 'admin_liga' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="inscritos">
              <Users className="h-4 w-4 mr-2" />
              Inscritos ({inscricoes?.length || 0})
            </TabsTrigger>
            {(user?.role === 'admin_liga' || user?.role === 'box_master') && (
              <TabsTrigger value="baterias">
                <Clock className="h-4 w-4 mr-2" />
                Baterias
              </TabsTrigger>
            )}
            {user?.role === 'admin_liga' && (
              <TabsTrigger value="config">
                <Settings className="h-4 w-4 mr-2" />
                Configuração
              </TabsTrigger>
            )}
          </TabsList>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <Card className="card-impacto">
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
                <CardDescription>Classificação dos atletas por pontuação</CardDescription>

                {/* Filtros do Leaderboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select
                      value={categoriaFiltro || "todas"}
                      onValueChange={(v) => setCategoriaFiltro(v === "todas" ? undefined : v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Faixa Etária</label>
                    <Select
                      value={faixaEtariaFiltro || "todas"}
                      onValueChange={(v) => setFaixaEtariaFiltro(v === "todas" ? undefined : v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="18-29">18-29</SelectItem>
                        <SelectItem value="30-39">30-39</SelectItem>
                        <SelectItem value="40-49">40-49</SelectItem>
                        <SelectItem value="50+">50+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {!leaderboard || leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum resultado registrado ainda
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Pos.</TableHead>
                        <TableHead>Atleta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Faixa Etária</TableHead>
                        <TableHead className="text-right">Pontos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((item: any, index: number) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-bold">
                            {index === 0 && <Medal className="h-5 w-5 text-yellow-500 inline mr-1" />}
                            {index === 1 && <Medal className="h-5 w-5 text-gray-400 inline mr-1" />}
                            {index === 2 && <Medal className="h-5 w-5 text-orange-600 inline mr-1" />}
                            {index + 1}º
                          </TableCell>
                          <TableCell className="font-medium">{item.userName || "Atleta"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.categoria}</Badge>
                          </TableCell>
                          <TableCell>{item.faixaEtaria}</TableCell>
                          <TableCell className="text-right font-bold">
                            {item.pontos || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inscritos */}
          <TabsContent value="inscritos">
            <Card className="card-impacto">
              <CardHeader>
                <CardTitle>Lista de Inscritos</CardTitle>
                <CardDescription>Atletas confirmados no campeonato</CardDescription>
              </CardHeader>

              <CardContent>
                {!inscricoes || inscricoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum atleta inscrito ainda
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Atleta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Faixa Etária</TableHead>
                        <TableHead>Data Inscrição</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscricoes.map((insc: any) => (
                        <TableRow key={insc.id}>
                          <TableCell className="font-medium">{insc.userName || "Atleta"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{insc.categoria}</Badge>
                          </TableCell>
                          <TableCell>{insc.faixaEtaria}</TableCell>
                          <TableCell>
                            {format(new Date(insc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Confirmado</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Baterias (Admin/Box Master) */}
          {(user?.role === 'admin_liga' || user?.role === 'box_master') && (
            <TabsContent value="baterias">
              <GestaoBaterias campeonatoId={campeonatoId} />
            </TabsContent>
          )}

          {/* Configuração de Pontuação (Admin Liga) */}
          {user?.role === 'admin_liga' && (
            <TabsContent value="config">
              <ConfiguracaoPontuacao campeonatoId={campeonatoId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
