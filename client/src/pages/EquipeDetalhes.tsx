import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Trophy, Users, Crown, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

export default function EquipeDetalhes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/equipes/:id");
  const teamId = params?.id ? parseInt(params.id) : 0;

  const [dialogAddMembro, setDialogAddMembro] = useState(false);

  const { data: equipe, refetch: refetchEquipe } = trpc.teams.getById.useQuery(
    { teamId },
    { enabled: !!teamId }
  );

  const { data: membros, refetch: refetchMembros } = trpc.teams.getMembers.useQuery(
    { teamId },
    { enabled: !!teamId }
  );

  const { data: alunos } = trpc.user.getByBox.useQuery(
    { boxId: user?.boxId || 0 },
    { enabled: !!user?.boxId }
  );

  const addMembroMutation = trpc.teams.addMember.useMutation({
    onSuccess: () => {
      refetchMembros();
      refetchEquipe();
      toast.success("Membro adicionado!");
    },
  });

  const removeMembroMutation = trpc.teams.removeMember.useMutation({
    onSuccess: () => {
      refetchMembros();
      refetchEquipe();
      toast.success("Membro removido");
    },
  });

  const handleAddMembro = (userId: number) => {
    addMembroMutation.mutate({ teamId, userId });
    setDialogAddMembro(false);
  };

  const handleRemoveMembro = (userId: number) => {
    if (confirm("Tem certeza que deseja remover este membro?")) {
      removeMembroMutation.mutate({ teamId, userId });
    }
  };

  const souCapitao = equipe && equipe.capitao_id === user?.id;
  const membrosIds = membros?.map((m: any) => m.user_id) || [];
  const alunosDisponiveis = alunos?.filter((a: any) => 
    a.role === "atleta" && !membrosIds.includes(a.id)
  ) || [];

  if (!equipe) {
    return (
      <AppLayout>
        <div className="container max-w-4xl py-8">
          <p>Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl py-8">
        <Button variant="ghost" onClick={() => navigate("/equipes")} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Header da Equipe */}
        <Card className="mb-6" style={{ borderLeftColor: equipe.cor, borderLeftWidth: '6px' }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{equipe.nome}</CardTitle>
                {equipe.descricao && (
                  <p className="text-muted-foreground">{equipe.descricao}</p>
                )}
              </div>
              {souCapitao && (
                <Button onClick={() => setDialogAddMembro(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Adicionar Membro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Pontos Totais</p>
                  <p className="text-xl font-bold">{equipe.pontos_totais}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Membros</p>
                  <p className="text-xl font-bold">{membros?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Capitão</p>
                  <p className="text-sm font-semibold">{equipe.capitao_nome}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Membros */}
        <Card>
          <CardHeader>
            <CardTitle>Membros da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {membros && membros.length > 0 ? (
                membros.map((membro: any) => (
                  <div
                    key={membro.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      {membro.role === 'capitao' && <Crown className="w-5 h-5 text-primary" />}
                      <div>
                        <p className="font-semibold">{membro.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {membro.categoria} • {membro.role === 'capitao' ? 'Capitão' : 'Membro'}
                        </p>
                      </div>
                    </div>
                    {souCapitao && membro.role !== 'capitao' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMembro(membro.user_id)}
                        className="text-destructive"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum membro ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Adicionar Membro */}
        <Dialog open={dialogAddMembro} onOpenChange={setDialogAddMembro}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro</DialogTitle>
              <DialogDescription>Selecione um atleta para adicionar à equipe</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alunosDisponiveis.length > 0 ? (
                alunosDisponiveis.map((aluno: any) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer"
                    onClick={() => handleAddMembro(aluno.id)}
                  >
                    <div>
                      <p className="font-semibold">{aluno.name}</p>
                      <p className="text-xs text-muted-foreground">{aluno.categoria}</p>
                    </div>
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Todos os atletas já estão na equipe
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
