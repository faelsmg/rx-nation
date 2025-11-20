import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { Dumbbell, CheckCircle, Trophy, Medal, Clock, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";

export default function WodDoDia() {
  const { data: wodHoje, isLoading } = trpc.wods.getToday.useQuery();
  const { data: resultados } = trpc.resultados.getByWod.useQuery(
    { wodId: wodHoje?.id! },
    { enabled: !!wodHoje?.id }
  );
  const checkinMutation = trpc.checkins.create.useMutation();
  const resultadoMutation = trpc.resultados.create.useMutation();
  const utils = trpc.useUtils();
  
  const [checkedIn, setCheckedIn] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  
  // Form state
  const [tempo, setTempo] = useState("");
  const [reps, setReps] = useState("");
  const [carga, setCarga] = useState("");
  const [rxOuScale, setRxOuScale] = useState<"rx" | "scale">("rx");
  const [observacoes, setObservacoes] = useState("");

  const handleCheckin = async () => {
    if (!wodHoje) return;
    try {
      await checkinMutation.mutateAsync({
        wodId: wodHoje.id,
        boxId: wodHoje.boxId,
      });
      setCheckedIn(true);
      toast.success("Check-in realizado! +10 pontos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer check-in");
    }
  };

  const handleSubmitResultado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wodHoje) return;

    try {
      await resultadoMutation.mutateAsync({
        wodId: wodHoje.id,
        tempo: tempo ? parseInt(tempo) : undefined,
        reps: reps ? parseInt(reps) : undefined,
        carga: carga ? parseInt(carga) : undefined,
        rxOuScale,
        observacoes: observacoes || undefined,
      });
      
      toast.success("Resultado registrado! +20 pontos");
      setShowResultForm(false);
      setTempo("");
      setReps("");
      setCarga("");
      setObservacoes("");
      utils.resultados.getByUser.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar resultado");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-primary" />
            WOD do Dia
          </h1>
          <p className="text-muted-foreground">Treino de hoje</p>
        </div>

        {isLoading ? (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : wodHoje ? (
          <>
            <Card className="card-impacto">
              <CardHeader>
                <CardTitle className="text-3xl text-primary">{wodHoje.titulo}</CardTitle>
                <p className="text-muted-foreground">
                  {wodHoje.tipo.toUpperCase()}
                  {wodHoje.timeCap && ` • Time Cap: ${wodHoje.timeCap} min`}
                  {wodHoje.duracao && ` • Duração: ${wodHoje.duracao} min`}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="whitespace-pre-wrap text-lg">{wodHoje.descricao}</div>
                
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleCheckin}
                    disabled={checkedIn || checkinMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {checkedIn ? "Check-in Feito!" : "Fazer Check-in"}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowResultForm(!showResultForm)}
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    {showResultForm ? "Cancelar" : "Registrar Resultado"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            {resultados && resultados.length > 0 && (
              <Card className="card-impacto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {resultados.length} atleta{resultados.length > 1 ? 's' : ''} completou este WOD
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resultados.map((resultado: any, index: number) => {
                      const isTop3 = index < 3;
                      const medalColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600';
                      
                      return (
                        <div
                          key={resultado.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            isTop3 ? 'bg-accent/50 border-primary/20' : 'bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isTop3 ? (
                              <Medal className={`w-6 h-6 ${medalColor}`} />
                            ) : (
                              <span className="text-muted-foreground font-bold w-6 text-center">
                                {index + 1}
                              </span>
                            )}
                            
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {resultado.user?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <p className="font-semibold">{resultado.user?.name || 'Atleta'}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {resultado.tempo && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(resultado.tempo / 60)}:{String(resultado.tempo % 60).padStart(2, '0')}
                                  </span>
                                )}
                                {resultado.reps && (
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    {resultado.reps} reps
                                  </span>
                                )}
                                {resultado.carga && (
                                  <span>{resultado.carga}kg</span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  resultado.rxOuScale === 'rx' 
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                }`}>
                                  {resultado.rxOuScale === 'rx' ? 'RX' : 'Scaled'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {showResultForm && (
              <Card className="card-impacto">
                <CardHeader>
                  <CardTitle>Registrar Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitResultado} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {wodHoje.tipo.toLowerCase().includes("time") && (
                        <div className="space-y-2">
                          <Label htmlFor="tempo">Tempo (segundos)</Label>
                          <Input
                            id="tempo"
                            type="number"
                            value={tempo}
                            onChange={(e) => setTempo(e.target.value)}
                            placeholder="Ex: 720 (12 min)"
                          />
                        </div>
                      )}
                      
                      {wodHoje.tipo.toLowerCase().includes("amrap") && (
                        <div className="space-y-2">
                          <Label htmlFor="reps">Repetições</Label>
                          <Input
                            id="reps"
                            type="number"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            placeholder="Ex: 150"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="carga">Carga (kg)</Label>
                        <Input
                          id="carga"
                          type="number"
                          value={carga}
                          onChange={(e) => setCarga(e.target.value)}
                          placeholder="Ex: 60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Modalidade</Label>
                      <RadioGroup value={rxOuScale} onValueChange={(v) => setRxOuScale(v as "rx" | "scale")}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rx" id="rx" />
                          <Label htmlFor="rx" className="font-normal cursor-pointer">
                            RX (Como prescrito)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="scale" id="scale" />
                          <Label htmlFor="scale" className="font-normal cursor-pointer">
                            Scaled (Adaptado)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações (opcional)</Label>
                      <Textarea
                        id="observacoes"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Como foi o treino? Alguma dificuldade?"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={resultadoMutation.isPending}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {resultadoMutation.isPending ? "Salvando..." : "Salvar Resultado"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="card-impacto">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Nenhum WOD disponível para hoje. Entre em contato com seu box.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
