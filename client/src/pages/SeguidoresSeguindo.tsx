import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/Avatar";
import { Link } from "wouter";
import { Users, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SeguidoresSeguindo() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = parseInt(userIdParam || "0");
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"seguidores" | "seguindo">("seguidores");

  // Queries
  const { data: seguidores, isLoading: isLoadingSeguidores } = trpc.perfilPublico.getSeguidores.useQuery({
    userId,
    limit: 100,
  });

  const { data: seguindo, isLoading: isLoadingSeguindo } = trpc.perfilPublico.getSeguindo.useQuery({
    userId,
    limit: 100,
  });

  // Mutations
  const seguirMutation = trpc.perfilPublico.seguir.useMutation({
    onSuccess: () => {
      toast.success("Você começou a seguir este atleta!");
      utils.perfilPublico.getSeguidores.invalidate();
      utils.perfilPublico.getSeguindo.invalidate();
      utils.perfilPublico.verificarSeguindo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao seguir atleta");
    },
  });

  const deixarDeSeguirMutation = trpc.perfilPublico.deixarDeSeguir.useMutation({
    onSuccess: () => {
      toast.success("Você deixou de seguir este atleta");
      utils.perfilPublico.getSeguidores.invalidate();
      utils.perfilPublico.getSeguindo.invalidate();
      utils.perfilPublico.verificarSeguindo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deixar de seguir");
    },
  });

  const handleSeguir = (targetUserId: number) => {
    seguirMutation.mutate({ seguidoId: targetUserId });
  };

  const handleDeixarDeSeguir = (targetUserId: number) => {
    deixarDeSeguirMutation.mutate({ seguidoId: targetUserId });
  };

  // Verificar se usuário logado segue cada atleta
  const { data: seguindoMap } = trpc.perfilPublico.verificarSeguindoMultiplos.useQuery({
    seguidosIds: [
      ...(seguidores?.map(s => s.id) || []),
      ...(seguindo?.map(s => s.id) || [])
    ].filter((id): id is number => id !== null && id !== undefined),
  }, {
    enabled: !!user && (!!seguidores || !!seguindo),
  });

  const isLoadingAtual = activeTab === "seguidores" ? isLoadingSeguidores : isLoadingSeguindo;
  const listaAtual = activeTab === "seguidores" ? seguidores : seguindo;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold">Conexões</h1>
        </div>
        <p className="text-muted-foreground">
          Veja quem segue e quem é seguido por este atleta
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="seguidores">
            Seguidores ({seguidores?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="seguindo">
            Seguindo ({seguindo?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Loading State */}
        {isLoadingAtual && (
          <div className="flex justify-center items-center py-12 mt-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoadingAtual && listaAtual && listaAtual.length === 0 && (
          <Card className="text-center py-12 mt-6">
            <CardContent>
              <p className="text-muted-foreground">
                {activeTab === "seguidores" 
                  ? "Este atleta ainda não tem seguidores" 
                  : "Este atleta ainda não segue ninguém"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Seguidores */}
        <TabsContent value="seguidores" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seguidores?.map((seguidor) => {
              const estaSeguindo = seguindoMap?.[seguidor.id || 0];
              const isProprioUsuario = seguidor.id === user?.id;

              return (
                <Card key={seguidor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Link href={`/perfil/${seguidor.id}`}>
                        <Avatar
                          src={seguidor.avatarUrl}
                          alt={seguidor.name || "Atleta"}
                          fallback={seguidor.name || "Atleta"}
                          size="lg"
                        />
                      </Link>

                      <div className="flex-1">
                        <Link href={`/perfil/${seguidor.id}`}>
                          <h3 className="font-semibold hover:underline">
                            {seguidor.name || "Atleta"}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground capitalize">
                          {seguidor.categoria || "iniciante"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {!isProprioUsuario && (
                      <div className="flex gap-2">
                        {estaSeguindo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleDeixarDeSeguir(seguidor.id!)}
                            disabled={deixarDeSeguirMutation.isPending}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Deixar de Seguir
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => handleSeguir(seguidor.id!)}
                            disabled={seguirMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Seguir
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Lista de Seguindo */}
        <TabsContent value="seguindo" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seguindo?.map((seguido) => {
              const estaSeguindo = seguindoMap?.[seguido.id || 0];
              const isProprioUsuario = seguido.id === user?.id;

              return (
                <Card key={seguido.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Link href={`/perfil/${seguido.id}`}>
                        <Avatar
                          src={seguido.avatarUrl}
                          alt={seguido.name || "Atleta"}
                          fallback={seguido.name || "Atleta"}
                          size="lg"
                        />
                      </Link>

                      <div className="flex-1">
                        <Link href={`/perfil/${seguido.id}`}>
                          <h3 className="font-semibold hover:underline">
                            {seguido.name || "Atleta"}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground capitalize">
                          {seguido.categoria || "iniciante"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {!isProprioUsuario && (
                      <div className="flex gap-2">
                        {estaSeguindo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleDeixarDeSeguir(seguido.id!)}
                            disabled={deixarDeSeguirMutation.isPending}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Deixar de Seguir
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => handleSeguir(seguido.id!)}
                            disabled={seguirMutation.isPending}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Seguir
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
