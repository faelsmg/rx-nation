import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { List, Plus, Trash2, Video, Edit, Lock, Users, Crown, GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";

export default function MinhasPlaylists() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [playlistTipo, setPlaylistTipo] = useState<"pessoal" | "box" | "premium">("pessoal");
  const [playlistPreco, setPlaylistPreco] = useState("");
  
  const { user } = useAuth();

  const { data: playlists, isLoading } = trpc.playlists.getByUser.useQuery();
  const { data: playlistDetails } = trpc.playlists.getById.useQuery(
    { id: selectedPlaylist?.id },
    { enabled: !!selectedPlaylist?.id }
  );

  const createMutation = trpc.playlists.create.useMutation();
  const updateMutation = trpc.playlists.update.useMutation();
  const deleteMutation = trpc.playlists.delete.useMutation();
  const removeItemMutation = trpc.playlists.removeItem.useMutation();
  const reorderItemsMutation = trpc.playlists.reorderItems.useMutation();
  const utils = trpc.useUtils();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !playlistDetails || !playlistDetails.isOwner) return;

    if (active.id !== over.id) {
      const oldIndex = playlistDetails.items.findIndex((item: any) => item.id === active.id);
      const newIndex = playlistDetails.items.findIndex((item: any) => item.id === over.id);

      const newItems = arrayMove(playlistDetails.items, oldIndex, newIndex);
      const itemIds = newItems.map((item: any) => item.id);

      try {
        await reorderItemsMutation.mutateAsync({
          playlistId: playlistDetails.id,
          itemIds,
        });
        utils.playlists.getById.invalidate({ id: playlistDetails.id });
        toast.success("✅ Ordem atualizada!");
      } catch (error: any) {
        toast.error(error.message || "Erro ao reordenar");
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error("Digite um nome para a playlist");
      return;
    }

    // Validar tipo box
    if (playlistTipo === "box" && user?.role !== "box_master" && user?.role !== "admin_liga") {
      toast.error("É necessário ser Box Master para criar playlists do tipo Box");
      return;
    }

    // Validar preço premium
    if (playlistTipo === "premium" && (!playlistPreco || Number(playlistPreco) <= 0)) {
      toast.error("Digite um preço válido para playlists Premium");
      return;
    }

    try {
      await createMutation.mutateAsync({
        nome: playlistName,
        descricao: playlistDesc || undefined,
        tipo: playlistTipo,
        publica: playlistTipo === "box", // Box sempre pública para membros
        preco: playlistTipo === "premium" ? Math.round(Number(playlistPreco) * 100) : undefined,
        boxId: playlistTipo === "box" && user?.boxId ? user.boxId : undefined,
      });

      toast.success("Playlist criada!");
      utils.playlists.getByUser.invalidate();
      setCreateDialogOpen(false);
      setPlaylistName("");
      setPlaylistDesc("");
      setPlaylistTipo("pessoal");
      setPlaylistPreco("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar playlist");
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!playlistName.trim() || !selectedPlaylist) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedPlaylist.id,
        nome: playlistName,
        descricao: playlistDesc || undefined,
      });

      toast.success("Playlist atualizada!");
      utils.playlists.getByUser.invalidate();
      setEditDialogOpen(false);
      setSelectedPlaylist(null);
      setPlaylistName("");
      setPlaylistDesc("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar playlist");
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta playlist?")) return;

    try {
      await deleteMutation.mutateAsync({ id: playlistId });
      toast.success("Playlist deletada!");
      utils.playlists.getByUser.invalidate();
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar playlist");
    }
  };

  const handleRemoveItem = async (playlistId: number, itemId: number) => {
    try {
      await removeItemMutation.mutateAsync({ playlistId, itemId });
      toast.success("Vídeo removido da playlist!");
      utils.playlists.getById.invalidate();
      utils.playlists.getByUser.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover vídeo");
    }
  };

  const openEditDialog = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setPlaylistName(playlist.nome);
    setPlaylistDesc(playlist.descricao || "");
    setEditDialogOpen(true);
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    return match ? match[1] : "";
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <List className="w-10 h-10 text-primary" />
              Minhas Playlists
            </h1>
            <p className="text-muted-foreground">
              Organize seus vídeos favoritos em playlists personalizadas
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Playlist
          </Button>
        </div>

        {isLoading ? (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Carregando playlists...</p>
            </CardContent>
          </Card>
        ) : playlists && playlists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist: any) => (
              <Card
                key={playlist.id}
                className="card-impacto cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{playlist.nome}</span>
                      {playlist.tipo === "box" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Box
                        </Badge>
                      )}
                      {playlist.tipo === "premium" && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(playlist)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                  {playlist.descricao && (
                    <CardDescription>{playlist.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {playlist.total_itens || 0} {playlist.total_itens === 1 ? "vídeo" : "vídeos"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-impacto">
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-muted-foreground">
                Você ainda não criou nenhuma playlist.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Playlist
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Detalhes da Playlist Selecionada */}
        {selectedPlaylist && playlistDetails && (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle className="text-2xl">{playlistDetails.nome}</CardTitle>
              {playlistDetails.descricao && (
                <CardDescription>{playlistDetails.descricao}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {playlistDetails.items && playlistDetails.items.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={playlistDetails.items.map((item: any) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      {playlistDetails.items.map((item: any) => (
                        <SortablePlaylistItem
                          key={item.id}
                          item={item}
                          playlistId={playlistDetails.id}
                          isOwner={playlistDetails.isOwner}
                          onRemove={handleRemoveItem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Esta playlist está vazia. Adicione vídeos da Biblioteca ou WODs Famosos!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog de Criar Playlist */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Playlist</DialogTitle>
              <DialogDescription>
                Crie uma playlist para organizar seus vídeos favoritos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Ex: Meus Favoritos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  placeholder="Ex: Vídeos que quero revisar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Playlist</Label>
                <Select value={playlistTipo} onValueChange={(v: any) => setPlaylistTipo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoal">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pessoal (apenas você)
                      </div>
                    </SelectItem>
                    {(user?.role === "box_master" || user?.role === "admin_liga") && (
                      <SelectItem value="box">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Box (membros do seu box)
                        </div>
                      </SelectItem>
                    )}
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Premium (paga)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {playlistTipo === "pessoal" && "Apenas você pode ver esta playlist"}
                  {playlistTipo === "box" && "Todos os membros do seu box poderão ver e copiar"}
                  {playlistTipo === "premium" && "Outros usuários pagarão para acessar"}
                </p>
              </div>

              {playlistTipo === "premium" && (
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    value={playlistPreco}
                    onChange={(e) => setPlaylistPreco(e.target.value)}
                    placeholder="Ex: 29.90"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePlaylist} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Playlist */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Playlist</DialogTitle>
              <DialogDescription>
                Atualize as informações da sua playlist
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição (opcional)</Label>
                <Input
                  id="edit-description"
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdatePlaylist} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Componente sortable para itens da playlist
function SortablePlaylistItem({ item, playlistId, isOwner, onRemove }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?]+)/);
    return match ? match[1] : url;
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
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
          {isOwner && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <Video className="w-4 h-4 text-primary" />
          {item.titulo}
        </CardTitle>
        {item.descricao && (
          <CardDescription className="text-sm">{item.descricao}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {item.categoria && (
            <span className="text-xs text-muted-foreground capitalize">
              {item.categoria}
            </span>
          )}
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(playlistId, item.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
