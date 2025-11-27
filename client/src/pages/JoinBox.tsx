import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function JoinBox() {
  const [, params] = useRoute("/join/:slug");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [processando, setProcessando] = useState(false);

  const slug = params?.slug || "";

  const { data: box, isLoading, error } = trpc.convites.buscarPorSlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Se usuário já está logado e vinculado a este box, redirecionar
  useEffect(() => {
    if (user && box && user.boxId === box.id) {
      setLocation("/dashboard");
    }
  }, [user, box, setLocation]);

  // Se usuário está logado mas não vinculado, vincular automaticamente
  useEffect(() => {
    if (user && box && !user.boxId && !processando) {
      setProcessando(true);
      // Aqui precisaríamos de uma procedure para vincular usuário existente ao box
      // Por enquanto, apenas redireciona para completar perfil
      setLocation("/perfil/editar");
    }
  }, [user, box, processando, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>
              Este link de convite não existe ou está incorreto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/")}
            >
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!box.ativo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
            <CardTitle>Box Inativo</CardTitle>
            <CardDescription>
              Este box não está aceitando novos cadastros no momento
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {APP_LOGO ? (
              <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 mx-auto" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary">RX</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">Junte-se ao {box.nome}</CardTitle>
          <CardDescription>
            Você foi convidado para fazer parte deste box
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Box */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg">{box.nome}</h3>
            {(box.cidade || box.estado) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {box.cidade}
                  {box.cidade && box.estado && ", "}
                  {box.estado}
                </span>
              </div>
            )}
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-semibold">O que você terá acesso:</h4>
            <ul className="space-y-2">
              {[
                "WODs diários personalizados",
                "Acompanhamento de PRs e evolução",
                "Rankings e gamificação",
                "Agenda de aulas e reservas",
                "Comunicados e novidades do box",
                "Badges e conquistas",
              ].map((beneficio, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-4">
            {user ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setLocation("/perfil/editar")}
              >
                Completar Cadastro
              </Button>
            ) : (
              <>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Criar Conta e Entrar
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Ao criar sua conta, você será automaticamente vinculado ao {box.nome}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
