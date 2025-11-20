import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Users, Trophy, Plus, Crown, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Equipes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [dialogCriar, setDialogCriar] = useState(false);
  const [novaEquipe, setNovaEquipe] = useState({
    nome: "",
    descricao: "",
    cor: "#F2C200",
  });

  const { data: equipes, isLoading, refetch } = trpc.teams.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const { data: minhasEquipes, refetch: refetchMinhas } = trpc.teams.getMyTeams.useQuery();

  const createMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      refetch();
      refetchMinhas();
      setDialogCriar(false);
      resetForm();
      toast.success("Equipe criada com sucesso!");
    },
  });

  const resetForm = () => {
    setNovaEquipe({
      nome: "",
      descricao: "",
      cor: "#F2C200",
    });
  };

  const handleCreate = () => {
    if (!novaEquipe.nome) {
      toast.error("Digite o nome da equipe");
      return;
    }

    createMutation.mutate(novaEquipe);
  };

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Equipes</h1>
            <p className="text-muted-foreground">Forme equipes e compita em desafios coletivos</p>
          </div>
          <Button onClick={() => setDialogCriar(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Equipe
          </Button>
        </div>

        {/* Minhas Equipes */}
        {minhasEquipes && minhasEquipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Minhas Equipes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {minhasEquipes.map((equipe: any) => (
                <Card
                  key={equipe.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/equipes/${equipe.id}`)}
                  style={{ borderLeftColor: equipe.cor, borderLeftWidth: '4px' }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {equipe.meu_role === 'capitao' && <Crown className="w-5 h-5 text-primary" />}
                        {equipe.nome}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {equipe.total_membros}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {equipe.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">{equipe.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span>{equipe.pontos_totais} pontos</span>
                      </div>
                      <span>Capitão: {equipe.capitao_nome}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Todas as Equipes do Box */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Todas as Equipes do Box</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-muted" />
                  <CardContent className="h-24 bg-muted/50" />
                </Card>
              ))}
            </div>
          ) : equipes && equipes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipes.map((equipe: any) => (
                <Card
                  key={equipe.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => navigate(`/equipes/${equipe.id}`)}
                  style={{ borderLeftColor: equipe.cor, borderLeftWidth: '4px' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{equipe.nome}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {equipe.descricao && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{equipe.descricao}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{equipe.total_membros} membros</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span>{equipe.pontos_totais} pts</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Capitão: {equipe.capitao_nome}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Nenhuma equipe ainda</p>
                <p className="text-sm">Crie a primeira equipe do box!</p>
              </div>
            </Card>
          )}
        </div>

        {/* Dialog de Criar Equipe */}
        <Dialog open={dialogCriar} onOpenChange={setDialogCriar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Equipe</DialogTitle>
              <DialogDescription>Monte sua equipe e convide outros atletas para participar</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome da Equipe *</Label>
                <Input
                  value={novaEquipe.nome}
                  onChange={(e) => setNovaEquipe({ ...novaEquipe, nome: e.target.value })}
                  placeholder="Ex: Team Thunder"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={novaEquipe.descricao}
                  onChange={(e) => setNovaEquipe({ ...novaEquipe, descricao: e.target.value })}
                  placeholder="Descreva sua equipe..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Cor da Equipe</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={novaEquipe.cor}
                    onChange={(e) => setNovaEquipe({ ...novaEquipe, cor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <span className="text-sm text-muted-foreground">{novaEquipe.cor}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? "Criando..." : "Criar Equipe"}
                </Button>
                <Button variant="outline" onClick={() => setDialogCriar(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
