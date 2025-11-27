import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConfiguracaoSMTP() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPass: "",
    smtpFrom: '"RX Nation" <noreply@rxnation.com>',
    smtpProvider: "custom" as "gmail" | "sendgrid" | "aws_ses" | "custom",
  });
  const [emailTeste, setEmailTeste] = useState(user?.email || "");
  const [testando, setTestando] = useState(false);
  const [testeResultado, setTesteResultado] = useState<{ success: boolean; message: string } | null>(null);

  const { data: config, isLoading } = trpc.configuracoes.get.useQuery();
  const updateSMTP = trpc.configuracoes.updateSMTP.useMutation();
  const testarSMTP = trpc.configuracoes.testarSMTP.useMutation();

  useEffect(() => {
    if (config) {
      setFormData({
        smtpHost: config.smtpHost || "",
        smtpPort: config.smtpPort || 587,
        smtpSecure: config.smtpSecure || false,
        smtpUser: config.smtpUser || "",
        smtpPass: config.smtpPass || "",
        smtpFrom: config.smtpFrom || '"RX Nation" <noreply@rxnation.com>',
        smtpProvider: (config.smtpProvider as any) || "custom",
      });
    }
  }, [config]);

  const handleProviderChange = (provider: string) => {
    const providerValue = provider as "gmail" | "sendgrid" | "aws_ses" | "custom";
    setFormData(prev => ({ ...prev, smtpProvider: providerValue }));

    // Preencher automaticamente com configurações padrão
    if (provider === "gmail") {
      setFormData(prev => ({
        ...prev,
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpProvider: "gmail",
      }));
    } else if (provider === "sendgrid") {
      setFormData(prev => ({
        ...prev,
        smtpHost: "smtp.sendgrid.net",
        smtpPort: 587,
        smtpSecure: false,
        smtpProvider: "sendgrid",
      }));
    } else if (provider === "aws_ses") {
      setFormData(prev => ({
        ...prev,
        smtpHost: "email-smtp.us-east-1.amazonaws.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpProvider: "aws_ses",
      }));
    }
  };

  const handleSave = async () => {
    try {
      await updateSMTP.mutateAsync(formData);
      toast.success("Configurações SMTP salvas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    }
  };

  const handleTest = async () => {
    if (!emailTeste) {
      toast.error("Digite um email para teste");
      return;
    }

    setTestando(true);
    setTesteResultado(null);

    try {
      const result = await testarSMTP.mutateAsync({
        ...formData,
        emailTeste,
      });

      setTesteResultado(result);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      setTesteResultado({
        success: false,
        message: error.message || "Erro ao testar configuração",
      });
      toast.error("Erro ao testar configuração");
    } finally {
      setTestando(false);
    }
  };

  if (user?.role !== "admin_liga") {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Acesso restrito a administradores da liga</p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configuração SMTP</h1>
          <p className="text-muted-foreground">
            Configure o servidor de email para envio de notificações e emails automáticos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provedor de Email</CardTitle>
                <CardDescription>
                  Escolha um provedor ou configure manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Select value={formData.smtpProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="aws_ses">AWS SES</SelectItem>
                      <SelectItem value="custom">Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Host SMTP</Label>
                    <Input
                      value={formData.smtpHost}
                      onChange={e => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Porta</Label>
                    <Input
                      type="number"
                      value={formData.smtpPort}
                      onChange={e => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Conexão Segura (SSL/TLS)</Label>
                    <p className="text-xs text-muted-foreground">
                      Ative para porta 465, desative para porta 587
                    </p>
                  </div>
                  <Switch
                    checked={formData.smtpSecure}
                    onCheckedChange={checked => setFormData(prev => ({ ...prev, smtpSecure: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Usuário SMTP</Label>
                  <Input
                    value={formData.smtpUser}
                    onChange={e => setFormData(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="seu-email@gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Senha/Token</Label>
                  <Input
                    type="password"
                    value={formData.smtpPass}
                    onChange={e => setFormData(prev => ({ ...prev, smtpPass: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Remetente (From)</Label>
                  <Input
                    value={formData.smtpFrom}
                    onChange={e => setFormData(prev => ({ ...prev, smtpFrom: e.target.value }))}
                    placeholder='"RX Nation" <noreply@rxnation.com>'
                  />
                </div>

                <Button onClick={handleSave} disabled={updateSMTP.isPending} className="w-full">
                  {updateSMTP.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Teste de Conexão */}
            <Card>
              <CardHeader>
                <CardTitle>Testar Configuração</CardTitle>
                <CardDescription>
                  Envie um email de teste para verificar se tudo está funcionando
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email para Teste</Label>
                  <Input
                    type="email"
                    value={emailTeste}
                    onChange={e => setEmailTeste(e.target.value)}
                    placeholder="seu-email@example.com"
                  />
                </div>

                <Button
                  onClick={handleTest}
                  disabled={testando || !emailTeste}
                  variant="outline"
                  className="w-full"
                >
                  {testando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Email de Teste
                    </>
                  )}
                </Button>

                {testeResultado && (
                  <div
                    className={`p-4 rounded-lg flex items-start gap-3 ${
                      testeResultado.success
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    {testeResultado.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={testeResultado.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                        {testeResultado.message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guia */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📖 Guia Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Gmail</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Ative a verificação em 2 etapas</li>
                    <li>Gere uma senha de app</li>
                    <li>Use a senha de app no campo "Senha"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">SendGrid</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Crie uma API Key no painel</li>
                    <li>Use "apikey" como usuário</li>
                    <li>Cole a API Key no campo "Senha"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">AWS SES</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Crie credenciais SMTP no console</li>
                    <li>Verifique seu domínio/email</li>
                    <li>Use as credenciais SMTP geradas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚠️ Importante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  • As senhas são armazenadas de forma segura no banco de dados
                </p>
                <p>
                  • Sempre teste a configuração antes de salvar
                </p>
                <p>
                  • Para Gmail, use senhas de app, não sua senha principal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
