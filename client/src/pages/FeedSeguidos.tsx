import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/Avatar";
import { Link } from "wouter";
import { Dumbbell, Trophy, Award, Clock, Weight, Loader2 } from "lucide-react";

export default function FeedSeguidos() {
  const [filtroTipo, setFiltroTipo] = useState<'wod' | 'pr' | 'badge' | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: atividades, isLoading } = trpc.feedSeguidos.getAtividades.useQuery({
    tipo: filtroTipo,
    limit,
    offset,
  });

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const handleChangeFiltro = (tipo: 'wod' | 'pr' | 'badge' | 'todas') => {
    setFiltroTipo(tipo === 'todas' ? undefined : tipo);
    setOffset(0); // Reset offset ao mudar filtro
  };

  const formatarTempo = (segundos: number | null) => {
    if (!segundos) return '-';
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const formatarData = (date: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - new Date(date).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `há ${minutos}min`;
    if (horas < 24) return `há ${horas}h`;
    if (dias === 1) return 'ontem';
    return `há ${dias}d`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Feed de Amigos 🤝</h1>
        <p className="text-muted-foreground">
          Acompanhe as conquistas dos atletas que você segue
        </p>
      </div>

      {/* Filtros */}
      <Tabs defaultValue="todas" className="mb-6" onValueChange={(value) => handleChangeFiltro(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="wod">WODs</TabsTrigger>
          <TabsTrigger value="pr">PRs</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && atividades && atividades.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Nenhuma atividade encontrada.
            </p>
            <p className="text-sm text-muted-foreground">
              Comece seguindo atletas para ver suas conquistas aqui!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {atividades?.map((atividade, index) => (
          <Card key={`${atividade.tipo}-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Link href={`/perfil/${atividade.userId}`}>
                  <Avatar
                    src={atividade.userAvatar}
                    alt={atividade.userName || 'Atleta'}
                    fallback={atividade.userName || 'Atleta'}
                    size="md"
                  />
                </Link>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/perfil/${atividade.userId}`}>
                      <span className="font-semibold hover:underline">
                        {atividade.userName}
                      </span>
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatarData(atividade.createdAt)}
                    </span>
                  </div>

                  {/* WOD Completado */}
                  {atividade.tipo === 'wod' && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Dumbbell className="w-4 h-4" />
                        <span>completou o WOD</span>
                      </div>
                      <CardTitle className="text-lg mb-2">{atividade.wodTitulo}</CardTitle>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Tipo:</span>
                          <span className="text-muted-foreground">{atividade.wodTipo}</span>
                        </div>
                        {atividade.tempo && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatarTempo(atividade.tempo)}</span>
                          </div>
                        )}
                        {atividade.reps && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Reps:</span>
                            <span>{atividade.reps}</span>
                          </div>
                        )}
                        {atividade.carga && (
                          <div className="flex items-center gap-1">
                            <Weight className="w-4 h-4" />
                            <span>{atividade.carga}kg</span>
                          </div>
                        )}
                        {atividade.rxOuScale && (
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              atividade.rxOuScale === 'rx' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {atividade.rxOuScale.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PR Registrado */}
                  {atividade.tipo === 'pr' && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>registrou um novo PR</span>
                      </div>
                      <CardTitle className="text-lg mb-2">{atividade.movimento}</CardTitle>
                      <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
                        <Weight className="w-6 h-6" />
                        <span>{atividade.carga} kg</span>
                      </div>
                    </div>
                  )}

                  {/* Badge Conquistado */}
                  {atividade.tipo === 'badge' && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span>conquistou um badge</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{atividade.badgeIcone}</div>
                        <div>
                          <CardTitle className="text-lg">{atividade.badgeNome}</CardTitle>
                          <CardDescription>{atividade.badgeDescricao}</CardDescription>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {atividades && atividades.length >= limit && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="outline">
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
