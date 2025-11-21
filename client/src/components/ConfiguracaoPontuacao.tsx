import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Plus, Trash2, RotateCcw, Save, Loader2 } from "lucide-react";

interface ConfiguracaoPontuacaoProps {
  campeonatoId: number;
}

interface ConfigItem {
  posicao: number;
  pontos: number;
}

export default function ConfiguracaoPontuacao({ campeonatoId }: ConfiguracaoPontuacaoProps) {
  const [configuracoes, setConfiguracoes] = useState<ConfigItem[]>([
    { posicao: 1, pontos: 100 },
    { posicao: 2, pontos: 95 },
    { posicao: 3, pontos: 90 },
  ]);
  const [editando, setEditando] = useState(false);

  const utils = trpc.useUtils();

  // Carregar configuração existente
  const { data: configExistente, isLoading } = trpc.pontuacao.getConfig.useQuery({
    campeonatoId,
  });

  // Configurar pontuação
  const configurar = trpc.pontuacao.configurar.useMutation({
    onSuccess: () => {
      toast.success("Configuração de pontuação salva com sucesso!");
      utils.pontuacao.getConfig.invalidate({ campeonatoId });
      setEditando(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar configuração");
    },
  });

  // Carregar configuração existente quando disponível
  useEffect(() => {
    if (configExistente && configExistente.length > 0) {
      setConfiguracoes(
        configExistente.map((c) => ({
          posicao: c.posicao,
          pontos: c.pontos,
        }))
      );
    }
  }, [configExistente]);

  const usarPadrao = () => {
    const padrao: ConfigItem[] = [];
    for (let i = 1; i <= 10; i++) {
      padrao.push({
        posicao: i,
        pontos: 100 - (i - 1) * 5, // 100, 95, 90, 85...
      });
    }
    setConfiguracoes(padrao);
    setEditando(true);
  };

  const adicionarPosicao = () => {
    const ultimaPosicao = configuracoes[configuracoes.length - 1];
    const novaPosicao = ultimaPosicao ? ultimaPosicao.posicao + 1 : 1;
    const novosPontos = ultimaPosicao ? Math.max(ultimaPosicao.pontos - 5, 0) : 100;

    setConfiguracoes([...configuracoes, { posicao: novaPosicao, pontos: novosPontos }]);
    setEditando(true);
  };

  const removerPosicao = (index: number) => {
    if (configuracoes.length <= 1) {
      toast.error("Deve haver pelo menos 1 posição configurada");
      return;
    }
    setConfiguracoes(configuracoes.filter((_, i) => i !== index));
    setEditando(true);
  };

  const atualizarPontos = (index: number, pontos: number) => {
    const novasConfigs = [...configuracoes];
    novasConfigs[index] = { ...novasConfigs[index], pontos };
    setConfiguracoes(novasConfigs);
    setEditando(true);
  };

  const validarConfiguracoes = (): boolean => {
    // Verificar se pontos são decrescentes
    for (let i = 0; i < configuracoes.length - 1; i++) {
      if (configuracoes[i].pontos <= configuracoes[i + 1].pontos) {
        toast.error(`Os pontos devem ser decrescentes. ${configuracoes[i].posicao}º lugar deve ter mais pontos que ${configuracoes[i + 1].posicao}º lugar.`);
        return false;
      }
    }

    // Verificar se todos os pontos são >= 0
    if (configuracoes.some((c) => c.pontos < 0)) {
      toast.error("Pontos não podem ser negativos");
      return false;
    }

    return true;
  };

  const salvar = () => {
    if (!validarConfiguracoes()) {
      return;
    }

    configurar.mutate({
      campeonatoId,
      configuracoes,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração de Pontuação
            </CardTitle>
            <CardDescription>
              Defina quantos pontos cada posição recebe. Pontos devem ser decrescentes (1º &gt; 2º &gt; 3º...).
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={usarPadrao}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Usar Padrão
            </Button>
            {editando && (
              <Button size="sm" onClick={salvar} disabled={configurar.isPending}>
                {configurar.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview da Configuração */}
        {!editando && configExistente && configExistente.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Configuração Atual:</p>
            <div className="flex flex-wrap gap-2">
              {configuracoes.slice(0, 5).map((config) => (
                <Badge key={config.posicao} variant="outline">
                  {config.posicao}º = {config.pontos} pts
                </Badge>
              ))}
              {configuracoes.length > 5 && (
                <Badge variant="outline">+{configuracoes.length - 5} posições</Badge>
              )}
            </div>
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto"
              onClick={() => setEditando(true)}
            >
              Editar configuração
            </Button>
          </div>
        )}

        {/* Tabela de Configuração */}
        {(editando || !configExistente || configExistente.length === 0) && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Posição</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configuracoes.map((config, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge>{config.posicao}º lugar</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.pontos}
                          onChange={(e) => atualizarPontos(index, parseInt(e.target.value) || 0)}
                          className="w-32"
                          min={0}
                        />
                        <span className="text-sm text-muted-foreground">pontos</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerPosicao(index)}
                        disabled={configuracoes.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button variant="outline" size="sm" onClick={adicionarPosicao}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Posição
            </Button>
          </>
        )}

        {/* Dica */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <strong>Dica:</strong> A configuração padrão usa a fórmula: 1º = 100 pts, 2º = 95 pts, 3º = 90 pts, 4º = 85 pts...
          Você pode personalizar para dar mais peso às primeiras posições (ex: 1º = 150, 2º = 120, 3º = 100).
        </div>
      </CardContent>
    </Card>
  );
}
