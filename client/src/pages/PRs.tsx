import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Plus, TrendingUp, Video, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MOVIMENTOS_PR } from "@/const";
import PREvolutionChart from "@/components/PREvolutionChart";
import { ShareCardDialog } from "@/components/ShareCardDialog";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PRs() {
  const { data: prs, isLoading } = trpc.prs.getByUser.useQuery();
  const createPrMutation = trpc.prs.create.useMutation();
  const utils = trpc.useUtils();
  
  const [showForm, setShowForm] = useState(false);
  const [movimento, setMovimento] = useState("");
  const [carga, setCarga] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<any>(null);
  const { user } = useAuth();
  const { data: pontuacao } = trpc.pontuacoes.getByUser.useQuery(
    undefined,
    { enabled: !!user }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movimento || !carga) {
      toast.error("Preencha movimento e carga");
      return;
    }

    try {
      await createPrMutation.mutateAsync({
        movimento,
        carga: parseFloat(carga),
        data: new Date(),
        observacoes: observacoes || undefined,
        videoUrl: videoUrl || undefined,
      });
      
      toast.success("PR registrado com sucesso! +30 pontos");
      setShowForm(false);
      setMovimento("");
      setCarga("");
      setObservacoes("");
      setVideoUrl("");
      utils.prs.getByUser.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar PR");
    }
  };

  const formatData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Agrupar PRs por movimento
  const prsPorMovimento = prs?.reduce((acc, pr) => {
    if (!acc[pr.movimento]) {
      acc[pr.movimento] = [];
    }
    acc[pr.movimento].push(pr);
    return acc;
  }, {} as Record<string, typeof prs>);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-primary" />
              Personal Records
            </h1>
            <p className="text-muted-foreground">Seus recordes pessoais</p>
          </div>
          <Button
            size="lg"
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            {showForm ? "Cancelar" : "Novo PR"}
          </Button>
        </div>

        {showForm && (
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle>Registrar Novo PR</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="movimento">Movimento *</Label>
                    <Select value={movimento} onValueChange={setMovimento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o movimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOVIMENTOS_PR.map((mov) => (
                          <SelectItem key={mov} value={mov}>
                            {mov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="carga">Carga (kg) *</Label>
                    <Input
                      id="carga"
                      type="number"
                      step="0.5"
                      value={carga}
                      onChange={(e) => setCarga(e.target.value)}
                      placeholder="Ex: 100"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Como foi o levantamento? Alguma observação?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Vídeo do Recorde (opcional)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ou outro link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole o link do vídeo do seu recorde (YouTube, Instagram, etc.)
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={createPrMutation.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createPrMutation.isPending ? "Salvando..." : "Salvar PR"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : prsPorMovimento && Object.keys(prsPorMovimento).length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(prsPorMovimento).map(([mov, movPrs]) => {
              const melhorPr = movPrs[0]; // Já vem ordenado por carga desc
              const historico = movPrs.slice(1, 4); // Últimos 3 PRs anteriores
              
              return (
                <Card key={mov} className="card-impacto">
                  <CardHeader>
                    <CardTitle className="text-xl">{mov}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {melhorPr.carga}
                      </span>
                      <span className="text-xl text-muted-foreground">kg</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {formatData(melhorPr.data)}
                    </p>
                    
                    {melhorPr.observacoes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{melhorPr.observacoes}"
                      </p>
                    )}
                    
                    {melhorPr.videoUrl && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Video className="w-4 h-4 text-primary" />
                          Vídeo do Recorde
                        </p>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={melhorPr.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            title="Vídeo do PR"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedPR(melhorPr);
                        setShareDialogOpen(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar PR
                    </Button>
                    
                    {historico.length > 0 && (
                      <div className="pt-4 border-t space-y-4">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Evolução
                        </p>
                        <PREvolutionChart data={movPrs} movimento={mov} />
                        <div className="space-y-1">
                          {historico.map((pr) => (
                            <div key={pr.id} className="flex justify-between text-sm text-muted-foreground">
                              <span>{pr.carga} kg</span>
                              <span>{formatData(pr.data)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="card-impacto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Nenhum PR registrado ainda. Comece registrando seu primeiro recorde!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Share Card Dialog */}
        {selectedPR && user && (
          <ShareCardDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            type="pr"
            atletaNome={user.name || "Atleta"}
            boxNome={"RX Nation"}
            categoria={user.categoria?.toUpperCase() || "ATLETA"}
            pontosTotais={pontuacao?.reduce((sum, p) => sum + p.pontos, 0) || 0}
            ranking={undefined}
            movimento={selectedPR.movimento}
            carga={selectedPR.carga}
            unidade="kg"
            dataRecorde={selectedPR.data.toString()}
          />
        )}
      </div>
    </AppLayout>
  );
}
