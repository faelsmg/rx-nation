import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, TrendingUp, Trophy, Building2, Calendar } from "lucide-react";

/**
 * Página de Relatórios Globais (Admin Liga)
 * Exibe métricas e estatísticas gerais da liga
 */
export default function RelatoriosGlobais() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Relatórios Globais</h1>
            <p className="text-muted-foreground">
              Métricas e estatísticas gerais da RX Nation
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atletas</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,543</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boxes Ativos</CardTitle>
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +3 novos boxes este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WODs Realizados</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18,432</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campeonatos Ativos</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 finalizando esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="engajamento" className="space-y-6">
          <TabsList>
            <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="boxes">Boxes</TabsTrigger>
          </TabsList>

          {/* Aba Engajamento */}
          <TabsContent value="engajamento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento de Atletas</CardTitle>
                <CardDescription>
                  Métricas de atividade e participação dos atletas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atletas Ativos (últimos 7 dias)</span>
                    <span className="text-2xl font-bold">1,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retenção Mensal</span>
                    <span className="text-2xl font-bold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Média de WODs por Atleta/Semana</span>
                    <span className="text-2xl font-bold">3.2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Badges Conquistados (este mês)</span>
                    <span className="text-2xl font-bold">542</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Geral</CardTitle>
                <CardDescription>
                  Estatísticas de performance dos atletas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">PRs Registrados (este mês)</span>
                    <span className="text-2xl font-bold">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Média de Pontos por Atleta</span>
                    <span className="text-2xl font-bold">1,856</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atletas Nível Platina</span>
                    <span className="text-2xl font-bold">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Atletas Nível Ouro</span>
                    <span className="text-2xl font-bold">385</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
                <CardDescription>
                  Métricas financeiras da liga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Receita Mensal (Assinaturas)</span>
                    <span className="text-2xl font-bold">R$ 127.450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Receita de Campeonatos</span>
                    <span className="text-2xl font-bold">R$ 45.200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Marketplace (Comissões)</span>
                    <span className="text-2xl font-bold">R$ 8.750</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Mensal</span>
                    <span className="text-2xl font-bold text-primary">R$ 181.400</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Boxes */}
          <TabsContent value="boxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Boxes</CardTitle>
                <CardDescription>
                  Métricas dos boxes afiliados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Boxes Ativos</span>
                    <span className="text-2xl font-bold">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Média de Atletas por Box</span>
                    <span className="text-2xl font-bold">56</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Box com Maior Engajamento</span>
                    <span className="text-lg font-bold">CrossFit Ipanema</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Novos Boxes (este mês)</span>
                    <span className="text-2xl font-bold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
