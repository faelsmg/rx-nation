import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Compass, Users, Crown, Copy, Video, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function DescobrirPlaylists() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const { data: boxPlaylists, isLoading: loadingBox } = trpc.playlists.getBoxPlaylists.useQuery();
  const { data: premiumPlaylists, isLoading: loadingPremium } = trpc.playlists.getPremiumPlaylists.useQuery();
  const { data: playlistDetails } = trpc.playlists.getById.useQuery(
    { id: selectedPlaylist?.id },
    { enabled: !!selectedPlaylist?.id }
  );

  const copyMutation = trpc.playlists.copy.useMutation();
  const utils = trpc.useUtils();
  const { user } = useAuth();

  const handleBuyPlaylist = async (playlist: any) => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar");
      return;
    }

    try {
      toast.info("💳 Redirecionando para checkout...");

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlist.id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Erro ao criar sessão de pagamento");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento");
    }
  };

  const handleCopyPlaylist = async () => {
    if (!selectedPlaylist) return;

    try {
      await copyMutation.mutateAsync({
        playlistId: selectedPlaylist.id,
        novoNome: novoNome.trim() || undefined,
      });

      toast.success("Playlist copiada para sua conta!");
      utils.playlists.getByUser.invalidate();
      setCopyDialogOpen(false);
      setNovoNome("");
      setSelectedPlaylist(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao copiar playlist");
    }
  };

  const openCopyDialog = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setNovoNome(`${playlist.nome} (Cópia)`);
    setCopyDialogOpen(true);
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    return match ? match[1] : "";
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Compass className="w-10 h-10 text-primary" />
            Descobrir Playlists
          </h1>
          <p className="text-muted-foreground">
            Explore playlists compartilhadas e copie para sua conta
          </p>
        </div>

        <Tabs defaultValue="box" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="box" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Do Meu Box
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Premium
            </TabsTrigger>
          </TabsList>

          {/* Playlists do Box */}
          <TabsContent value="box" className="space-y-6">
            {loadingBox ? (
              <Card className="card-impacto">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Carregando playlists...</p>
                </CardContent>
              </Card>
            ) : boxPlaylists && boxPlaylists.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {boxPlaylists.map((playlist: any) => (
                  <Card key={playlist.id} className="card-impacto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{playlist.nome}</span>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Box
                          </Badge>
                        </div>
                      </CardTitle>
                      {playlist.descricao && (
                        <CardDescription>{playlist.descricao}</CardDescription>
                      )}
                      <CardDescription className="text-xs">
                        Por: {playlist.criador_nome}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {playlist.total_itens || 0} {playlist.total_itens === 1 ? "vídeo" : "vídeos"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedPlaylist(playlist)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Ver Vídeos
                        </Button>
                        <Button
                          onClick={() => openCopyDialog(playlist)}
                          variant="default"
                          size="sm"
                          className="flex-1"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-impacto">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma playlist compartilhada no seu box ainda.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Playlists Premium */}
          <TabsContent value="premium" className="space-y-6">
            {loadingPremium ? (
              <Card className="card-impacto">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Carregando playlists...</p>
                </CardContent>
              </Card>
            ) : premiumPlaylists && premiumPlaylists.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {premiumPlaylists.map((playlist: any) => (
                  <Card key={playlist.id} className="card-impacto border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{playlist.nome}</span>
                          <Badge variant="default" className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium
                          </Badge>
                        </div>
                      </CardTitle>
                      {playlist.descricao && (
                        <CardDescription>{playlist.descricao}</CardDescription>
                      )}
                      <CardDescription className="text-xs">
                        Por: {playlist.criador_nome}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {playlist.total_itens || 0} {playlist.total_itens === 1 ? "vídeo" : "vídeos"}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(playlist.preco)}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleBuyPlaylist(playlist)}
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar por {formatPrice(playlist.preco)}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-impacto">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhuma playlist premium disponível no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Visualização Detalhada da Playlist */}
        {selectedPlaylist && playlistDetails && (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {playlistDetails.nome}
                {playlistDetails.tipo === "box" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Box
                  </Badge>
                )}
              </CardTitle>
              {playlistDetails.descricao && (
                <CardDescription>{playlistDetails.descricao}</CardDescription>
              )}
              <CardDescription className="text-xs">
                Por: {selectedPlaylist.criador_nome}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playlistDetails.items && playlistDetails.items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {playlistDetails.items.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${getVideoId(item.videoUrl)}`}
                          title={item.titulo}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          {item.titulo}
                        </CardTitle>
                        {item.descricao && (
                          <CardDescription className="text-sm">{item.descricao}</CardDescription>
                        )}
                      </CardHeader>
                      {item.categoria && (
                        <CardContent>
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.categoria}
                          </span>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Esta playlist está vazia.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog de Copiar Playlist */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copiar Playlist</DialogTitle>
              <DialogDescription>
                A playlist será copiada para sua conta como "Pessoal"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="novo-nome">Nome da Cópia</Label>
                <Input
                  id="novo-nome"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Minha Cópia"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCopyPlaylist} disabled={copyMutation.isPending}>
                {copyMutation.isPending ? "Copiando..." : "Copiar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
