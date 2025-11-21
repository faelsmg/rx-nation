import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Award, Lock, FileDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gerarCertificadoBadge } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ShareCardDialog } from "@/components/ShareCardDialog";
import { useState } from "react";

export default function Badges() {
  const { data: userBadges } = trpc.badges.getUserBadges.useQuery();
  const { data: allBadges } = trpc.badges.getAll.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: pontuacao } = trpc.pontuacoes.getByUser.useQuery(
    undefined,
    { enabled: !!user }
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const handleExportarCertificado = (badge: any, dataConquista: string) => {
    if (!user) return;

    const doc = gerarCertificadoBadge(
      {
        nome: user.name || "Atleta",
        email: user.email || "",
      },
      {
        nome: badge.nome,
        descricao: badge.descricao,
        dataConquista,
      }
    );

    doc.save(`certificado-${badge.nome.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast.success("Certificado gerado com sucesso!");
  };
  
  const unlockedBadgeIds = new Set(userBadges?.map(ub => ub.badge?.id) || []);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-primary" />
            Minhas Badges
          </h1>
          <p className="text-muted-foreground">Conquistas desbloqueadas</p>
        </div>

        {/* Badges Conquistados */}
        {userBadges && userBadges.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Conquistados</h2>
              <p className="text-muted-foreground">{userBadges.length} badge{userBadges.length > 1 ? 's' : ''} desbloqueado{userBadges.length > 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-onboarding="badges-grid">
              {userBadges.map((ub) => (
                <Card key={ub.id} className="card-impacto border-primary/50 bg-primary/5">
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="text-6xl mb-2">{ub.badge?.icone || "🏅"}</div>
                    <Badge className="bg-primary text-primary-foreground">Desbloqueado</Badge>
                    <h3 className="text-xl font-bold text-primary">{ub.badge?.nome}</h3>
                    <p className="text-sm text-muted-foreground">{ub.badge?.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ub.dataConquista).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportarCertificado(ub.badge, ub.dataConquista.toString())}
                        className="flex-1"
                      >
                        <FileDown className="mr-2 h-3 w-3" />
                        Certificado
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedBadge(ub);
                          setShareDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Share2 className="mr-2 h-3 w-3" />
                        Compartilhar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Badges Bloqueados */}
        {allBadges && allBadges.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Disponíveis</h2>
              <p className="text-muted-foreground">Continue treinando para desbloquear</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-onboarding="badges-grid">
              {allBadges
                .filter((badge: any) => !unlockedBadgeIds.has(badge.id))
                .map((badge: any) => (
                  <Card key={badge.id} className="card-impacto opacity-60">
                    <CardContent className="pt-6 text-center space-y-3">
                      <div className="relative">
                        <div className="text-6xl mb-2 grayscale opacity-50">{badge.icone || "🏅"}</div>
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground" />
                      </div>
                      <Badge variant="secondary">Bloqueado</Badge>
                      <h3 className="text-xl font-bold">{badge.nome}</h3>
                      <p className="text-sm text-muted-foreground">{badge.descricao}</p>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </div>
        )}

        {(!userBadges || userBadges.length === 0) && (!allBadges || allBadges.length === 0) && (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Nenhuma badge disponível no momento.</p>
            </CardContent>
          </Card>
        )}

        {/* Share Card Dialog */}
        {selectedBadge && user && (
          <ShareCardDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            type="badge"
            atletaNome={user.name || "Atleta"}
            boxNome={"Impacto Pro League"}
            categoria={user.categoria?.toUpperCase() || "ATLETA"}
            pontosTotais={pontuacao?.reduce((sum, p) => sum + p.pontos, 0) || 0}
            ranking={undefined}
            badgeNome={selectedBadge.badge?.nome}
            badgeIcone={selectedBadge.badge?.icone}
            badgeDescricao={selectedBadge.badge?.descricao}
          />
        )}
      </div>
    </AppLayout>
  );
}
