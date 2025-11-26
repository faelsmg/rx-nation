import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ComparacaoResultadoProps {
  comparacao: {
    resultado: {
      tempo?: number | null;
      reps?: number | null;
      carga?: number | null;
    };
    mediaBox?: {
      mediaTempo?: number;
      mediaReps?: number;
      mediaCarga?: number;
      totalAtletas?: number;
    } | null;
    mediaCategoria?: {
      mediaTempo?: number;
      mediaReps?: number;
      mediaCarga?: number;
      totalAtletas?: number;
    } | null;
    percentis: {
      tempo?: number | null;
      reps?: number | null;
      carga?: number | null;
    };
  };
}

export function ComparacaoResultado({ comparacao }: ComparacaoResultadoProps) {
  if (!comparacao.resultado || !comparacao.mediaBox) {
    return null;
  }

  return (
    <Card className="card-impacto border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Você vs Média do Box
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Veja como seu resultado se compara com os outros atletas
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparação de Tempo */}
        {comparacao.resultado.tempo && comparacao.mediaBox.mediaTempo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Tempo</span>
              {comparacao.percentis.tempo && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  Top {comparacao.percentis.tempo}%
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Você</span>
                <span className="font-bold">
                  {Math.floor(comparacao.resultado.tempo / 60)}:{String(comparacao.resultado.tempo % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((comparacao.resultado.tempo / (comparacao.mediaBox.mediaTempo * 1.5)) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Média do Box</span>
                <span className="font-semibold">
                  {Math.floor(comparacao.mediaBox.mediaTempo / 60)}:{String(Math.round(comparacao.mediaBox.mediaTempo % 60)).padStart(2, '0')}
                </span>
              </div>
              <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-muted-foreground/50 transition-all"
                  style={{ width: '66%' }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {comparacao.resultado.tempo < comparacao.mediaBox.mediaTempo
                  ? `Você foi ${Math.round(((comparacao.mediaBox.mediaTempo - comparacao.resultado.tempo) / comparacao.mediaBox.mediaTempo) * 100)}% mais rápido que a média! 🔥`
                  : `Faltaram ${Math.round(((comparacao.resultado.tempo - comparacao.mediaBox.mediaTempo) / comparacao.mediaBox.mediaTempo) * 100)}% para atingir a média`}
              </p>
            </div>
          </div>
        )}

        {/* Comparação de Reps */}
        {comparacao.resultado.reps && comparacao.mediaBox.mediaReps && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Repetições</span>
              {comparacao.percentis.reps && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  Top {comparacao.percentis.reps}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">{comparacao.resultado.reps}</p>
                <p className="text-xs text-muted-foreground">Você</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{Math.round(comparacao.mediaBox.mediaReps)}</p>
                <p className="text-xs text-muted-foreground">Média</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {comparacao.resultado.reps > comparacao.mediaBox.mediaReps
                ? `Você fez ${Math.round(((comparacao.resultado.reps - comparacao.mediaBox.mediaReps) / comparacao.mediaBox.mediaReps) * 100)}% mais reps que a média! 💪`
                : `Faltaram ${Math.round(((comparacao.mediaBox.mediaReps - comparacao.resultado.reps) / comparacao.mediaBox.mediaReps) * 100)}% para atingir a média`}
            </p>
          </div>
        )}

        {/* Comparação de Carga */}
        {comparacao.resultado.carga && comparacao.mediaBox.mediaCarga && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Carga</span>
              {comparacao.percentis.carga && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  Top {comparacao.percentis.carga}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <p className="text-2xl font-bold text-primary">{comparacao.resultado.carga} kg</p>
                <p className="text-xs text-muted-foreground">Você</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-2xl font-bold">{Math.round(comparacao.mediaBox.mediaCarga)} kg</p>
                <p className="text-xs text-muted-foreground">Média</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {comparacao.resultado.carga > comparacao.mediaBox.mediaCarga
                ? `Você levantou ${Math.round(((comparacao.resultado.carga - comparacao.mediaBox.mediaCarga) / comparacao.mediaBox.mediaCarga) * 100)}% mais carga que a média! 🏋️`
                : `Faltaram ${Math.round(((comparacao.mediaBox.mediaCarga - comparacao.resultado.carga) / comparacao.mediaBox.mediaCarga) * 100)}% para atingir a média`}
            </p>
          </div>
        )}

        {/* Estatísticas Adicionais */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{comparacao.mediaBox.totalAtletas || 0}</p>
              <p className="text-xs text-muted-foreground">Atletas Registrados</p>
            </div>
            {comparacao.mediaCategoria && (
              <div>
                <p className="text-sm font-semibold">Sua Categoria</p>
                <p className="text-xs text-muted-foreground">
                  {comparacao.mediaCategoria.totalAtletas} atletas
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
