import { trpc } from "@/lib/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";

interface ResultadosBateriaProps {
  bateriaId: number;
}

export default function ResultadosBateria({ bateriaId }: ResultadosBateriaProps) {
  const { data: resultados, isLoading } = trpc.resultadosCampeonatos.listByBateria.useQuery({
    bateriaId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resultados || resultados.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhum resultado registrado ainda
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        Resultados
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Posição</TableHead>
            <TableHead>Atleta</TableHead>
            <TableHead>Tempo</TableHead>
            <TableHead>Reps</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultados.map((resultado) => (
            <TableRow key={resultado.id}>
              <TableCell>
                <Badge variant={resultado.posicao === 1 ? "default" : "outline"}>
                  {resultado.posicao}º
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{resultado.userName}</TableCell>
              <TableCell>
                {resultado.tempo ? `${Math.floor(resultado.tempo / 60)}:${(resultado.tempo % 60).toString().padStart(2, "0")}` : "-"}
              </TableCell>
              <TableCell>{resultado.reps || "-"}</TableCell>
              <TableCell className="text-right font-semibold">{resultado.pontos} pts</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
