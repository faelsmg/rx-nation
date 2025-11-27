import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Database, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

/**
 * Página de Configurações da Liga (Admin Liga)
 * Permite configurar parâmetros globais do sistema
 */
export default function Configuracoes() {
  const { user } = useAuth();
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [manutencaoMode, setManutencaoMode] = useState(false);

  const handleSalvar = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações da Liga</h1>
            <p className="text-muted-foreground">
              Gerencie configurações globais do sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="integracao">Integrações</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Liga</CardTitle>
                <CardDescription>
                  Configurações básicas da RX Nation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-liga">Nome da Liga</Label>
                  <Input
                    id="nome-liga"
                    defaultValue="RX Nation"
                    placeholder="Nome da liga"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    defaultValue="A maior liga de CrossFit do Brasil"
                    placeholder="Descrição da liga"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-contato">Email de Contato</Label>
                  <Input
                    id="email-contato"
                    type="email"
                    defaultValue="contato@rxnation.com.br"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Desabilita acesso de todos os usuários exceto admins
                    </p>
                  </div>
                  <Switch
                    checked={manutencaoMode}
                    onCheckedChange={setManutencaoMode}
                  />
                </div>

                <Button onClick={handleSalvar} className="w-full">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configurações de Notificações
                </CardTitle>
                <CardDescription>
                  Gerencie como os usuários recebem notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails para eventos importantes
                    </p>
                  </div>
                  <Switch
                    checked={notificacoesEmail}
                    onCheckedChange={setNotificacoesEmail}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações push via PWA
                    </p>
                  </div>
                  <Switch
                    checked={notificacoesPush}
                    onCheckedChange={setNotificacoesPush}
                  />
                </div>

                <Button onClick={handleSalvar} className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança e Privacidade
                </CardTitle>
                <CardDescription>
                  Configurações de segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tempo-sessao">Tempo de Sessão (minutos)</Label>
                  <Input
                    id="tempo-sessao"
                    type="number"
                    defaultValue="60"
                    placeholder="60"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requer 2FA para admins
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button onClick={handleSalvar} className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Integrações */}
          <TabsContent value="integracao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Integrações Externas
                </CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Webhooks)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    defaultValue="••••••••••••••••"
                    placeholder="Sua API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL de Webhook</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://exemplo.com/webhook"
                  />
                </div>

                <Button onClick={handleSalvar} className="w-full">
                  Salvar Integrações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
