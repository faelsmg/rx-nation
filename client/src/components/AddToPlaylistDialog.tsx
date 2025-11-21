import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoData: {
    tipo: "video_educacional" | "wod_famoso";
    videoId: string;
    titulo: string;
    descricao?: string;
    videoUrl: string;
    categoria?: string;
  };
}

export function AddToPlaylistDialog({
  open,
  onOpenChange,
  videoData,
}: AddToPlaylistDialogProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  const { data: playlists, isLoading } = trpc.playlists.getByUser.useQuery();
  const createPlaylistMutation = trpc.playlists.create.useMutation();
  const addItemMutation = trpc.playlists.addItem.useMutation();
  const utils = trpc.useUtils();

  const handleAddToPlaylist = async () => {
    try {
      let playlistId = Number(selectedPlaylistId);

      // Se está criando nova playlist
      if (showNewPlaylist) {
        if (!newPlaylistName.trim()) {
          toast.error("Digite um nome para a playlist");
          return;
        }

        const newPlaylist = await createPlaylistMutation.mutateAsync({
          nome: newPlaylistName,
          descricao: newPlaylistDesc || undefined,
        });

        playlistId = newPlaylist.id;
        toast.success("Playlist criada!");
      }

      if (!playlistId) {
        toast.error("Selecione uma playlist");
        return;
      }

      // Adicionar item à playlist
      await addItemMutation.mutateAsync({
        playlistId,
        ...videoData,
      });

      toast.success("Vídeo adicionado à playlist!");
      utils.playlists.getByUser.invalidate();
      onOpenChange(false);

      // Resetar form
      setSelectedPlaylistId("");
      setShowNewPlaylist(false);
      setNewPlaylistName("");
      setNewPlaylistDesc("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar à playlist");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar à Playlist</DialogTitle>
          <DialogDescription>
            Salve este vídeo em uma playlist para consulta rápida
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showNewPlaylist ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Nome da Playlist</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ex: Meus Favoritos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playlist-desc">Descrição (opcional)</Label>
                <Input
                  id="playlist-desc"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Ex: Vídeos que quero revisar"
                />
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowNewPlaylist(false)}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Carregando playlists...</p>
              ) : playlists && playlists.length > 0 ? (
                <RadioGroup value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {playlists.map((playlist: any) => (
                      <div key={playlist.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(playlist.id)} id={`playlist-${playlist.id}`} />
                        <Label
                          htmlFor={`playlist-${playlist.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{playlist.nome}</p>
                            {playlist.descricao && (
                              <p className="text-sm text-muted-foreground">{playlist.descricao}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {playlist.total_itens || 0} {playlist.total_itens === 1 ? "vídeo" : "vídeos"}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Você ainda não tem playlists. Crie uma agora!
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => setShowNewPlaylist(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Playlist
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleAddToPlaylist}
            disabled={(!selectedPlaylistId && !showNewPlaylist) || addItemMutation.isPending || createPlaylistMutation.isPending}
          >
            {addItemMutation.isPending || createPlaylistMutation.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
