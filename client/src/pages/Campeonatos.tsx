import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Users, Trophy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Campeonatos() {
  const { user } = useAuth();
  const { data: campeonatos } = trpc.campeonatos.getAbertos.useQuery();
  const inscricaoMutation = trpc.inscricoes.create.useMutation();
  const utils = trpc.useUtils();
  
  const [selectedCampeonato, setSelectedCampeonato] = useState<any>(null);

  const handleInscrever = async (campeonatoId: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para se inscrever");
      return;
    }

    try {
      await inscricaoMutation.mutateAsync({
        campeonatoId,
        categoria: user.categoria || "intermediario",
        faixaEtaria: user.faixaEtaria || "adulto",
      });
      
      toast.success("Inscrição realizada com sucesso! +50 pontos");
      utils.campeonatos.getAbertos.invalidate();
      setSelectedCampeonato(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar inscrição");
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campeonatos && campeonatos.length > 0 ? (
            campeonatos.map((camp) => (
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

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedCampeonato(camp)}
                        disabled={!camp.inscricoesAbertas}
                      >
                        {camp.inscricoesAbertas ? "Ver Detalhes e Inscrever-se" : "Inscrições Encerradas"}
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
