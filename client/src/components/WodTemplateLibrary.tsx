import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BookOpen, Play, TrendingUp, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WodTemplateLibraryProps {
  boxId?: number;
  onSelectTemplate: (template: any) => void;
}

export function WodTemplateLibrary({ boxId, onSelectTemplate }: WodTemplateLibraryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: templates = [], isLoading } = trpc.wodTemplates.getAll.useQuery({ boxId });
  const { data: favoritos = [] } = trpc.wodFavoritos.getByUser.useQuery();
  const incrementUsageMutation = trpc.wodTemplates.incrementUsage.useMutation();

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      incrementUsageMutation.mutate({ templateId: selectedTemplate.id });
      onSelectTemplate(selectedTemplate);
      setDialogOpen(false);
      toast.success(`Template "${selectedTemplate.nome}" selecionado!`);
    }
  };

  // Separar templates por categoria
  const classicTemplates = templates.filter((t) => t.categoria === "classico");
  const customTemplates = templates.filter((t) => t.categoria === "personalizado");
  
  // WODs favoritados (com dados completos do WOD)
  const favoritosWods = favoritos
    .map((f) => f.wod)
    .filter((wod): wod is NonNullable<typeof wod> => wod !== null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Biblioteca de Templates
          </CardTitle>
          <CardDescription>
            Selecione um WOD clássico ou personalizado para usar como base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Carregando templates...</p>
          ) : (
            <div className="space-y-6">
              {/* Meus Favoritos */}
              {favoritosWods.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    Meus Favoritos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoritosWods.map((wod) => (
                      <button
                        key={wod.id}
                        onClick={() => {
                          // Converter WOD para formato de template
                          const templateFromWod = {
                            id: wod.id,
                            nome: wod.titulo,
                            descricao: wod.descricao,
                            tipo: wod.tipo,
                            duracao: wod.duracao,
                            timeCap: wod.timeCap,
                            videoYoutubeUrl: wod.videoYoutubeUrl,
                          };
                          onSelectTemplate(templateFromWod);
                          toast.success(`WOD favorito "${wod.titulo}" selecionado!`);
                        }}
                        className="text-left p-4 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500 transition-all bg-card hover:bg-accent"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-foreground">{wod.titulo}</h4>
                          <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded">
                            {wod.tipo.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {wod.descricao}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {wod.timeCap && <span>⏱️ {wod.timeCap} min</span>}
                          <span className="text-yellow-600">⭐ Favorito</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Clássicos */}
              {classicTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    WODs Clássicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classicTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left p-4 rounded-lg border-2 border-border hover:border-primary transition-all bg-card hover:bg-accent"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-foreground">{template.nome}</h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {template.tipo.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {template.descricao}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {template.timeCap && <span>⏱️ {template.timeCap} min</span>}
                          {template.vezesUsado > 0 && (
                            <span>🔥 Usado {template.vezesUsado}x</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Personalizados */}
              {customTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Meus Templates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="text-left p-4 rounded-lg border-2 border-border hover:border-primary transition-all bg-card hover:bg-accent"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-foreground">{template.nome}</h4>
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                            {template.tipo.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {template.descricao}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {template.timeCap && <span>⏱️ {template.timeCap} min</span>}
                          {template.vezesUsado > 0 && (
                            <span>🔥 Usado {template.vezesUsado}x</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {templates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum template disponível ainda.</p>
                  <p className="text-sm mt-1">
                    Crie seu primeiro WOD e salve como template!
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Preview do Template */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.nome}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.tipo.toUpperCase()}
              {selectedTemplate?.timeCap && ` • Time Cap: ${selectedTemplate.timeCap} min`}
              {selectedTemplate?.duracao && ` • Duração: ${selectedTemplate.duracao} min`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedTemplate?.descricao}
              </p>
            </div>

            {selectedTemplate?.videoYoutubeUrl && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Vídeo Demonstrativo
                </h4>
                <a
                  href={selectedTemplate.videoYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Assistir no YouTube →
                </a>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleUseTemplate} className="flex-1">
                Usar este Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
