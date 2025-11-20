import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, Search, UserCheck, UserX, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AlunosTabProps {
  boxId: number;
}

export function AlunosTab({ boxId }: AlunosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("all");

  const { data: alunos, isLoading } = trpc.user.getByBox.useQuery(
    { boxId },
    { enabled: !!boxId }
  );

  const filteredAlunos = alunos?.filter((aluno: any) => {
    const matchesSearch =
      aluno.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      filterCategoria === "all" || aluno.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const getCategoriaColor = (categoria: string | null) => {
    switch (categoria) {
      case "iniciante":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "intermediario":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "avancado":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "elite":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Alunos do Box
            </CardTitle>
            <CardDescription>
              {filteredAlunos?.length || 0} atletas cadastrados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="intermediario">Intermediário</SelectItem>
              <SelectItem value="avancado">Avançado</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Alunos */}
        {isLoading ? (
          <p className="text-muted-foreground">Carregando alunos...</p>
        ) : filteredAlunos && filteredAlunos.length > 0 ? (
          <div className="grid gap-4">
            {filteredAlunos.map((aluno) => (
              <Card
                key={aluno.id}
                className="border-2 border-border hover:border-primary/40 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {(aluno as any).name || "Sem nome"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {aluno.email}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aluno.categoria && (
                            <Badge
                              variant="outline"
                              className={getCategoriaColor(aluno.categoria)}
                            >
                              {aluno.categoria.charAt(0).toUpperCase() +
                                aluno.categoria.slice(1)}
                            </Badge>
                          )}
                          {aluno.faixaEtaria && (
                            <Badge variant="outline" className="border-border">
                              {aluno.faixaEtaria} anos
                            </Badge>
                          )}
                          {aluno.role === "box_master" && (
                            <Badge
                              variant="outline"
                              className="bg-purple-500/10 text-purple-500 border-purple-500/20"
                            >
                              Box Master
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterCategoria !== "all"
                ? "Nenhum aluno encontrado com os filtros aplicados."
                : "Nenhum aluno cadastrado ainda."}
            </p>
          </div>
        )}

        {/* Estatísticas Rápidas */}
        {alunos && alunos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{alunos.length}</p>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {alunos.filter((a: any) => a.categoria === "elite").length}
                </p>
                <p className="text-sm text-muted-foreground">Atletas Elite</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {alunos.filter((a: any) => a.categoria === "iniciante").length}
                </p>
                <p className="text-sm text-muted-foreground">Iniciantes</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
