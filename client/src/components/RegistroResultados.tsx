import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Trophy } from "lucide-react";

interface RegistroResultadosProps {
  bateriaId: number;
  campeonatoId: number;
}

export default function RegistroResultados({ bateriaId, campeonatoId }: RegistroResultadosProps) {
  const [open, setOpen] = useState(false);
  const [inscricaoId, setInscricaoId] = useState<string>("");
  const [tempo, setTempo] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [posicao, setPosicao] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const utils = trpc.useUtils();

  // Listar inscritos do campeonato
  const { data: inscritos, isLoading: loadingInscritos } =
    trpc.campeonatos.listInscricoes.useQuery({
      campeonatoId,
    });

  // Registrar resultado
  const registrar = trpc.resultadosCampeonatos.registrar.useMutation({
    onSuccess: () => {
      toast.success("Resultado registrado com sucesso! Pontos calculados automaticamente.");
      utils.resultadosCampeonatos.listByBateria.invalidate({ bateriaId });
      utils.campeonatos.leaderboard.invalidate({ campeonatoId });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar resultado");
    },
  });

  const resetForm = () => {
    setInscricaoId("");
    setTempo("");
    setReps("");
    setPosicao("");
    setObservacoes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inscricaoId || !posicao) {
      toast.error("Atleta e posição são obrigatórios");
      return;
    }

    if (!tempo && !reps) {
      toast.error("Informe tempo ou reps");
      return;
    }

    registrar.mutate({
      inscricaoId: parseInt(inscricaoId),
      bateriaId,
      tempo: tempo ? parseInt(tempo) : undefined,
      reps: reps ? parseInt(reps) : undefined,
      posicao: parseInt(posicao),
      observacoes: observacoes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Trophy className="w-4 h-4 mr-2" />
          Registrar Resultado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Resultado</DialogTitle>
          <DialogDescription>
            Registre o resultado do atleta. Os pontos serão calculados automaticamente baseado na posição.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selecionar Atleta */}
          <div className="space-y-2">
            <Label htmlFor="atleta">Atleta *</Label>
            {loadingInscritos ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando atletas...
              </div>
            ) : (
              <Select value={inscricaoId} onValueChange={setInscricaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o atleta" />
                </SelectTrigger>
                <SelectContent>
                  {inscritos?.map((inscrito) => (
                    <SelectItem key={inscrito.id} value={inscrito.id.toString()}>
                      {inscrito.userName} - {inscrito.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tempo (segundos) */}
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo (segundos)</Label>
            <Input
              id="tempo"
              type="number"
              placeholder="Ex: 180 (3 minutos)"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
            />
          </div>

          {/* Reps */}
          <div className="space-y-2">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              placeholder="Ex: 150"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>

          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="posicao">Posição *</Label>
            <Input
              id="posicao"
              type="number"
              placeholder="Ex: 1 (1º lugar)"
              value={posicao}
              onChange={(e) => setPosicao(e.target.value)}
              min={1}
              required
            />
            <p className="text-xs text-muted-foreground">
              1º = 100 pts, 2º = 95 pts, 3º = 90 pts, 4º = 85 pts...
            </p>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Input
              id="observacoes"
              placeholder="Ex: RX, Scale, DNF..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={registrar.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={registrar.isPending}>
              {registrar.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
