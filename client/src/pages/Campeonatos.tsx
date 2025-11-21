import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Users, Trophy, CheckCircle, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function Campeonatos() {
  const { user } = useAuth();
  const { data: campeonatos } = trpc.campeonatos.list.useQuery();
  const { data: minhasInscricoes } = trpc.campeonatos.minhasInscricoes.useQuery(
    undefined,
    { enabled: !!user && user.role === "atleta" }
  );
  const inscricaoMutation = trpc.campeonatos.inscrever.useMutation();
  const utils = trpc.useUtils();
  
  const [selectedCampeonato, setSelectedCampeonato] = useState<any>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("abertos");

  const isInscrito = (campeonatoId: number) => {
    return minhasInscricoes?.some((insc: any) => insc.campeonatoId === campeonatoId);
  };

  const handleInscrever = async (campeonatoId: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para se inscrever");
      return;
    }

    if (user.role !== "atleta") {
      toast.error("Apenas atletas podem se inscrever em campeonatos");
      return;
    }

    try {
      await inscricaoMutation.mutateAsync({ campeonatoId });
      
      toast.success("Inscrição realizada com sucesso!");
      utils.campeonatos.minhasInscricoes.invalidate();
      setSelectedCampeonato(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar inscrição");
    }
  };

  // Filtros
  const campeonatosFiltrados = campeonatos?.filter((camp: any) => {
    if (tipoFiltro !== "todos" && camp.tipo !== tipoFiltro) return false;
    if (statusFiltro === "abertos" && !camp.inscricoesAbertas) return false;
    if (statusFiltro === "fechados" && camp.inscricoesAbertas) return false;
    return true;
  });

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      interno: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
      cidade: "bg-green-500/20 text-green-700 dark:text-green-400",
      regional: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
      estadual: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
      nacional: "bg-red-500/20 text-red-700 dark:text-red-400",
    };
    return colors[tipo] || colors.interno;
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Campeonatos
          </h1>
          <p className="text-muted-foreground">Eventos e competições disponíveis</p>
        </div>

        {/* Filtros */}
        <Card className="card-impacto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Campeonato</label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="cidade">Cidade</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="estadual">Estadual</SelectItem>
                    <SelectItem value="nacional">Nacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status das Inscrições</label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="abertos">Abertas</SelectItem>
                    <SelectItem value="fechados">Fechadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campeonatosFiltrados && campeonatosFiltrados.length > 0 ? (
            campeonatosFiltrados.map((camp: any) => (
              <Card key={camp.id} className="card-impacto hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-primary mb-2">{camp.nome}</CardTitle>
                      <Badge className={getTipoBadge(camp.tipo)}>
                        {camp.tipo.toUpperCase()}
                      </Badge>
                    </div>
                    {camp.inscricoesAbertas && (
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Inscrições Abertas
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(camp.dataInicio).toLocaleDateString("pt-BR")} até{" "}
                        {new Date(camp.dataFim).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    
                    {camp.local && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{camp.local}</span>
                      </div>
                    )}
                    
                    {camp.capacidade && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Capacidade: {camp.capacidade} atletas</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/campeonatos/${camp.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>

                    {user?.role === "atleta" && camp.inscricoesAbertas && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1" 
                            onClick={() => setSelectedCampeonato(camp)}
                            disabled={isInscrito(camp.id)}
                          >
                            {isInscrito(camp.id) ? "Já Inscrito" : "Inscrever-se"}
                          </Button>
                        </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{camp.nome}</DialogTitle>
                        <DialogDescription>
                          Detalhes do campeonato e inscrição
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Informações</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Tipo:</strong> {camp.tipo.toUpperCase()}</p>
                            <p><strong>Data:</strong> {new Date(camp.dataInicio).toLocaleDateString("pt-BR")} até {new Date(camp.dataFim).toLocaleDateString("pt-BR")}</p>
                            {camp.local && <p><strong>Local:</strong> {camp.local}</p>}
                            {camp.capacidade && <p><strong>Capacidade:</strong> {camp.capacidade} atletas</p>}
                            <p><strong>Peso no Ranking Anual:</strong> {camp.pesoRankingAnual}x</p>
                          </div>
                        </div>

                        {camp.inscricoesAbertas && (
                          <div className="space-y-3">
                            <div className="bg-primary/10 p-4 rounded-lg">
                              <p className="text-sm font-medium mb-2">Benefícios da Inscrição:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• +50 pontos de gamificação</li>
                                <li>• Participe do leaderboard</li>
                                <li>• Ganhe badges exclusivos</li>
                                <li>• Contribua para o ranking anual</li>
                              </ul>
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => handleInscrever(camp.id)}
                              disabled={inscricaoMutation.isPending}
                            >
                              {inscricaoMutation.isPending ? "Inscrevendo..." : "Confirmar Inscrição"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-impacto col-span-full">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Nenhum campeonato disponível no momento.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
