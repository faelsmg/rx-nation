import { useState } from "react";
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
import { toast } from "sonner";
import { CheckCircle2, XCircle, DollarSign, Download, Loader2, Users, TrendingUp, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GestaoInscricoes() {
  const [, params] = useRoute("/campeonatos/:id/inscricoes");
  const campeonatoId = parseInt(params?.id || "0");
  const { user } = useAuth();

  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroPagamento, setFiltroPagamento] = useState<string>("todos");

  const utils = trpc.useUtils();

  // Queries
  const { data: campeonato, isLoading: loadingCampeonato } = trpc.campeonatos.getById.useQuery({ id: campeonatoId });
  const { data: relatorio, isLoading: loadingRelatorio } = trpc.inscricoes.gerarRelatorio.useQuery(
    { campeonatoId },
    { enabled: !!campeonato }
  );

  // Mutations
  const aprovarMutation = trpc.inscricoes.aprovar.useMutation({
    onSuccess: () => {
      toast.success("Inscrição aprovada com sucesso!");
      utils.inscricoes.gerarRelatorio.invalidate({ campeonatoId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar inscrição");
    },
  });

  const rejeitarMutation = trpc.inscricoes.rejeitar.useMutation({
    onSuccess: () => {
      toast.success("Inscrição rejeitada");
      utils.inscricoes.gerarRelatorio.invalidate({ campeonatoId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao rejeitar inscrição");
    },
  });

  const confirmarPagamentoMutation = trpc.inscricoes.confirmarPagamento.useMutation({
    onSuccess: () => {
      toast.success("Pagamento confirmado!");
      utils.inscricoes.gerarRelatorio.invalidate({ campeonatoId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao confirmar pagamento");
    },
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      aprovada: { variant: "default", label: "Aprovada" },
      rejeitada: { variant: "destructive", label: "Rejeitada" },
    };
    const badge = badges[status] || badges.pendente;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getPagamentoBadge = (status: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      pago: { variant: "default", label: "Pago" },
      reembolsado: { variant: "secondary", label: "Reembolsado" },
    };
    const badge = badges[status] || badges.pendente;
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const exportarCSV = () => {
    if (!relatorio || !relatorio.inscricoes) return;

    const headers = ["ID", "Nome", "Email", "Categoria", "Faixa Etária", "Status", "Pagamento", "Data"];
    const rows = inscricoesFiltradas.map((i) => [
      i.id,
      i.userName || "N/A",
      i.userEmail || "N/A",
      i.categoria,
      i.faixaEtaria,
      i.status,
      i.statusPagamento,
      format(new Date(i.dataInscricao), "dd/MM/yyyy", { locale: ptBR }),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inscricoes-${campeonato?.nome || "campeonato"}.csv`;
    link.click();
    toast.success("CSV exportado com sucesso!");
  };

  if (loadingCampeonato || loadingRelatorio) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!campeonato) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campeonato não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  // Filtrar inscrições
  const inscricoesFiltradas = (relatorio?.inscricoes || []).filter((inscricao) => {
    if (filtroStatus !== "todas" && inscricao.status !== filtroStatus) return false;
    if (filtroCategoria !== "todas" && inscricao.categoria !== filtroCategoria) return false;
    if (filtroPagamento !== "todos" && inscricao.statusPagamento !== filtroPagamento) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestão de Inscrições</h1>
          <p className="text-muted-foreground mt-2">{campeonato.nome}</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Inscrições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{relatorio?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(relatorio?.porStatus as any)?.aprovada || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                Pagamentos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(relatorio?.porStatusPagamento as any)?.pago || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(relatorio?.porStatus as any)?.pendente || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Relatório por Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(relatorio?.porCategoria || {}).map(([categoria, count]) => (
                  <div key={categoria} className="flex justify-between items-center">
                    <span className="capitalize">{categoria}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(relatorio?.porFaixaEtaria || {}).map(([faixa, count]) => (
                  <div key={faixa} className="flex justify-between items-center">
                    <span>{faixa}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Exportação */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Inscrições</CardTitle>
                <CardDescription>Gerencie todas as inscrições do campeonato</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportarCSV}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="aprovada">Aprovadas</SelectItem>
                    <SelectItem value="rejeitada">Rejeitadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroPagamento} onValueChange={setFiltroPagamento}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="pago">Pagos</SelectItem>
                  <SelectItem value="reembolsado">Reembolsados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Faixa Etária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inscricoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma inscrição encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  inscricoesFiltradas.map((inscricao) => (
                    <TableRow key={inscricao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inscricao.userName || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">{inscricao.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{inscricao.categoria}</TableCell>
                      <TableCell>{inscricao.faixaEtaria}</TableCell>
                      <TableCell>{getStatusBadge(inscricao.status)}</TableCell>
                      <TableCell>{getPagamentoBadge(inscricao.statusPagamento)}</TableCell>
                      <TableCell>{format(new Date(inscricao.dataInscricao), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {inscricao.status === "pendente" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => aprovarMutation.mutate({ inscricaoId: inscricao.id })}
                                disabled={aprovarMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejeitarMutation.mutate({ inscricaoId: inscricao.id })}
                                disabled={rejeitarMutation.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {inscricao.statusPagamento === "pendente" && inscricao.status === "aprovada" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmarPagamentoMutation.mutate({ inscricaoId: inscricao.id })}
                              disabled={confirmarPagamentoMutation.isPending}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
