import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function DesafiosPersonalizadosIA() {
  const [gerando, setGerando] = useState(false);
  const utils = trpc.useUtils();
  
  const { data: desafios, isLoading } = trpc.desafios.getSemanaAtual.useQuery();
  const { data: progresso } = trpc.desafios.getMeuProgresso.useQuery();
  
  const gerarDesafiosMutation = trpc.desafios.gerarPersonalizadosIA.useMutation({
    onSuccess: () => {
      toast.success("Desafios personalizados gerados com sucesso! 🎯");
      utils.desafios.getSemanaAtual.invalidate();
      utils.desafios.getMeuProgresso.invalidate();
      setGerando(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar desafios: ${error.message}`);
      setGerando(false);
    },
  });

  const handleGerarDesafios = async () => {
    setGerando(true);
    gerarDesafiosMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="card-impacto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mapear progresso por desafio
  const progressoMap = new Map(
    progresso?.map(p => [p.desafioId, p]) || []
  );

  return (
    <Card className="card-impacto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Desafios Personalizados com IA
            </CardTitle>
            <CardDescription>
              Objetivos criados especialmente para você baseados no seu histórico
            </CardDescription>
          </div>
          <Button
            onClick={handleGerarDesafios}
            disabled={gerando}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {gerando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Novos Desafios
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!desafios || desafios.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nenhum desafio personalizado ainda.
            </p>
            <Button
              onClick={handleGerarDesafios}
              disabled={gerando}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {gerando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Meus Desafios
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {desafios.map((desafio) => {
              const prog = progressoMap.get(desafio.id);
              const progressoAtual = prog?.progressoAtual || 0;
              const percentual = Math.min(100, (progressoAtual / desafio.meta) * 100);
              const completado = prog?.completado || false;

              return (
                <Card
                  key={desafio.id}
                  className={`border-2 ${
                    completado
                      ? "border-green-500 bg-green-500/10"
                      : "border-primary/30"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{desafio.icone}</span>
                        <div>
                          <CardTitle className="text-lg">{desafio.titulo}</CardTitle>
                          <CardDescription className="text-xs">
                            {desafio.descricao}
                          </CardDescription>
                        </div>
                      </div>
                      {completado && (
                        <Trophy className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-bold">
                          {progressoAtual}/{desafio.meta}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            completado
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-primary to-primary/80"
                          }`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {completado ? "Completado!" : `${percentual.toFixed(0)}%`}
                        </span>
                        <span className="font-bold text-primary">
                          +{desafio.pontosRecompensa} pts
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
