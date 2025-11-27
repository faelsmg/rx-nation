import { useAuth } from "@/_core/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function EditarPerfil() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [nome, setNome] = useState(user?.name || "");
  const [categoria, setCategoria] = useState(user?.categoria || "");
  const [faixaEtaria, setFaixaEtaria] = useState(user?.faixaEtaria || "");
  const [biografia, setBiografia] = useState("");

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      utils.perfil.getCompleto.invalidate();
      utils.auth.me.invalidate();
      setLocation("/perfil");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      name: nome,
      categoria: categoria as any,
      faixaEtaria: faixaEtaria,
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/perfil")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Perfil</h1>
            <p className="text-muted-foreground">Atualize suas informações pessoais</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de Perfil */}
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Adicione ou altere sua foto de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-white">
                  {nome?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <Button type="button" variant="outline" disabled>
                    <Camera className="w-4 h-4 mr-2" />
                    Alterar Foto (Em breve)
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Básicas */}
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione sua categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faixaEtaria">Faixa Etária</Label>
                  <Select value={faixaEtaria} onValueChange={setFaixaEtaria}>
                    <SelectTrigger id="faixaEtaria">
                      <SelectValue placeholder="Selecione sua faixa etária" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24 anos</SelectItem>
                      <SelectItem value="25-29">25-29 anos</SelectItem>
                      <SelectItem value="30-34">30-34 anos</SelectItem>
                      <SelectItem value="35-39">35-39 anos</SelectItem>
                      <SelectItem value="40-44">40-44 anos</SelectItem>
                      <SelectItem value="45-49">45-49 anos</SelectItem>
                      <SelectItem value="50-54">50-54 anos</SelectItem>
                      <SelectItem value="55-59">55-59 anos</SelectItem>
                      <SelectItem value="60+">60+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="biografia">Biografia</Label>
                <Textarea
                  id="biografia"
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  placeholder="Conte um pouco sobre você, seus objetivos no CrossFit..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {biografia.length}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card className="card-impacto">
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Configure suas preferências de uso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Perfil Público</p>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros atletas vejam seu perfil
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar no Ranking</p>
                  <p className="text-sm text-muted-foreground">
                    Aparecer nos rankings públicos do box
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  Em breve
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/perfil")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
