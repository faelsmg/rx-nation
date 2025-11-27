import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar } from "@/components/Avatar";
import { Camera, Loader2, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
  onUploadSuccess?: (newAvatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, userName, onUploadSuccess }: AvatarUploadProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const uploadMutation = trpc.perfil.uploadAvatar.useMutation({
    onSuccess: (data) => {
      toast.success("Foto de perfil atualizada com sucesso! 📸");
      utils.perfil.getCompleto.invalidate();
      utils.auth.me.invalidate();
      onUploadSuccess?.(data.avatarUrl);
      setOpen(false);
      setPreview(null);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(`Erro ao fazer upload: ${error.message}`);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    uploadMutation.mutate({
      base64Image: preview,
      mimeType: selectedFile.type,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Foto de Perfil</DialogTitle>
          <DialogDescription>
            Escolha uma imagem para seu perfil (máx 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar
                src={preview || currentAvatar}
                alt={userName}
                fallback={userName}
                size="xl"
                className="w-32 h-32"
              />
            </div>
          </div>

          {/* Input de arquivo (oculto) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedFile ? "Escolher Outra Imagem" : "Escolher Imagem"}
            </Button>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Salvar Foto
                  </>
                )}
              </Button>
            )}
          </div>

          {selectedFile && (
            <p className="text-sm text-muted-foreground text-center">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
