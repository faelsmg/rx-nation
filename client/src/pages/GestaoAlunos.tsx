import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { trpc } from "@/lib/trpc";
import { Search, UserPlus, Shield, TrendingUp, Calendar, Dumbbell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GestaoAlunos() {
  const { user } = useAuth();
  const { data: alunos, isLoading, refetch } = trpc.gestaoAlunos.listar.useQuery();
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const promoverMutation = trpc.gestaoAlunos.promoverParaAdmin.useMutation({
    onSuccess: () => {
      toast.success("Aluno promovido para administrador com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao promover aluno: " + error.message);
    },
  });

  if (user?.role !== "box_master" && user?.role !== "admin_liga") {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando alunos...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Filtrar alunos
  const alunosFiltrados = alunos?.filter((aluno: any) => {
    const matchBusca =
      !busca ||
      aluno.name?.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.email?.toLowerCase().includes(busca.toLowerCase());

    const matchCategoria =
      filtroCategoria === "todas" || aluno.categoria === filtroCategoria;

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativos" && aluno.ativo) ||
      (filtroStatus === "inativos" && !aluno.ativo);

    return matchBusca && matchCategoria && matchStatus;
  });

  const totalAtivos = alunos?.filter((a: any) => a.ativo).length || 0;
  const totalInativos = alunos?.filter((a: any) => !a.ativo).length || 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestão de Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os atletas do seu box
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Alunos
                  </p>
                  <p className="text-3xl font-bold">{alunos?.length || 0}</p>
                </div>
                <UserPlus className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ativos</p>
                  <p className="text-3xl font-bold text-green-500">
                    {totalAtivos}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimos 7 dias
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-impacto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inativos</p>
                  <p className="text-3xl font-bold text-orange-500">
                    {totalInativos}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sem check-in recente
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Busque e filtre alunos por categoria e status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Alunos */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
            <CardDescription>
              {alunosFiltrados?.length || 0} aluno(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Faixa Etária</TableHead>
                    <TableHead className="text-center">Check-ins</TableHead>
                    <TableHead className="text-center">WODs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Check-in</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alunosFiltrados && alunosFiltrados.length > 0 ? (
                    alunosFiltrados.map((aluno: any) => (
                      <TableRow key={aluno.id}>
                        <TableCell className="font-medium">
                          {aluno.name || "Sem nome"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {aluno.email}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {aluno.categoria || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>{aluno.faixaEtaria || "N/A"}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {aluno.totalCheckins}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Dumbbell className="w-4 h-4 text-muted-foreground" />
                            {aluno.totalWods}
                          </div>
                        </TableCell>
                        <TableCell>
                          {aluno.ativo ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-medium">
                              Inativo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {aluno.ultimoCheckin
                            ? new Date(aluno.ultimoCheckin).toLocaleDateString(
                                "pt-BR"
                              )
                            : "Nunca"}
                        </TableCell>
                        <TableCell className="text-right">
                          {aluno.role !== "box_master" &&
                            aluno.role !== "admin_liga" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  promoverMutation.mutate({ userId: aluno.id })
                                }
                                disabled={promoverMutation.isPending}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Promover
                              </Button>
                            )}
                          {(aluno.role === "box_master" ||
                            aluno.role === "admin_liga") && (
                            <span className="text-xs text-muted-foreground">
                              Admin
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">
                          Nenhum aluno encontrado
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
