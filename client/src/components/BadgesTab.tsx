import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Award, Plus, Search, Trophy } from "lucide-react";
import { toast } from "sonner";

interface BadgesTabProps {
  boxId: number;
}

export function BadgesTab({ boxId }: BadgesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAtleta, setSelectedAtleta] = useState<number | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const utils = trpc.useUtils();

  // Buscar todos os badges disponíveis
  const { data: badges = [] } = trpc.badges.getAll.useQuery();

  // Buscar atletas do box
  const { data: atletas = [] } = trpc.user.getByBox.useQuery(
    { boxId },
    { enabled: !!boxId }
  );

  // Mutation para atribuir badge
  const assignBadgeMutation = trpc.badges.assign.useMutation({
    onSuccess: () => {
      toast.success("Badge atribuído com sucesso!");
      setDialogOpen(false);
      setSelectedAtleta(null);
      setSelectedBadge(null);
      utils.user.getByBox.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atribuir badge");
    },
  });

  const handleAssignBadge = () => {
    if (!selectedAtleta || !selectedBadge) {
      toast.error("Selecione um atleta e um badge");
      return;
    }

    assignBadgeMutation.mutate({
      userId: selectedAtleta,
      badgeId: selectedBadge,
    });
  };

  // Filtrar atletas por busca
  const filteredAtletas = atletas.filter((atleta: any) =>
    atleta.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar atletas com seus badges
  const atletasComBadges = filteredAtletas.map((atleta: any) => {
    // Buscar badges do atleta
    const atletaBadges = atleta.badges || [];
    return {
      ...atleta,
      badgesCount: atletaBadges.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Card de Atribuir Badge */}
      <Card className="card-impacto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Atribuir Badges
              </CardTitle>
              <CardDescription>
                Reconheça conquistas dos atletas atribuindo badges
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Atribuir Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Atribuir Badge</DialogTitle>
                  <DialogDescription>
                    Selecione um atleta e um badge para atribuir
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="atleta">Atleta</Label>
                    <Select
                      value={selectedAtleta?.toString()}
                      onValueChange={(value) => setSelectedAtleta(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um atleta" />
                      </SelectTrigger>
                      <SelectContent>
                        {atletas.map((atleta: any) => (
                          <SelectItem key={atleta.id} value={atleta.id.toString()}>
                            {atleta.name || atleta.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge</Label>
                    <Select
                      value={selectedBadge?.toString()}
                      onValueChange={(value) => setSelectedBadge(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um badge" />
                      </SelectTrigger>
                      <SelectContent>
                        {badges.map((badge: any) => (
                          <SelectItem key={badge.id} value={badge.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{badge.icone || "🏆"}</span>
                              <span>{badge.nome}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBadge && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        {badges.find((b) => b.id === selectedBadge)?.descricao}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAssignBadge}
                    disabled={!selectedAtleta || !selectedBadge || assignBadgeMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    {assignBadgeMutation.isPending ? "Atribuindo..." : "Atribuir"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Card de Atletas e Badges */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Badges dos Atletas
          </CardTitle>
          <CardDescription>
            Visualize os badges conquistados por cada atleta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabela de Atletas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Badges</TableHead>
                  <TableHead>Últimos Badges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atletasComBadges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum atleta encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  atletasComBadges.map((atleta: any) => (
                    <TableRow key={atleta.id}>
                      <TableCell className="font-medium">
                        {atleta.name || "Sem nome"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {atleta.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {atleta.badgesCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {atleta.badges && atleta.badges.length > 0 ? (
                            atleta.badges.slice(0, 5).map((badge: any, index: number) => (
                              <span
                                key={index}
                                className="text-xl"
                                title={badge.badge?.nome}
                              >
                                {badge.badge?.icone || "🏆"}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Nenhum badge ainda
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Card de Badges Disponíveis */}
      <Card className="card-impacto">
        <CardHeader>
          <CardTitle className="text-xl">Badges Disponíveis</CardTitle>
          <CardDescription>
            Todos os badges que podem ser atribuídos aos atletas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge: any) => (
              <div
                key={badge.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{badge.icone || "🏆"}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{badge.nome}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {badge.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Critério: {badge.criterio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Nenhum badge cadastrado ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
