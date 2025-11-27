import { useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, CheckCircle2 } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SetupBoxMaster() {
  const [, params] = useRoute("/setup-box/:slug");
  const { user, loading: authLoading } = useAuth();
  
  const slug = params?.slug || "";

  const { data: box, isLoading, error } = trpc.convites.buscarPorSlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Se usuário já está logado e é box_master deste box, redirecionar
  useEffect(() => {
    if (user && box && user.boxId === box.id && user.role === "box_master") {
      window.location.href = "/dashboard";
    }
  }, [user, box]);

  const handleLogin = () => {
    // Construir URL de login com parâmetros para vinculação
    const callbackUrl = `/api/oauth/callback?boxSlug=${slug}&setupBox=true`;
    const loginUrl = `${import.meta.env.VITE_OAUTH_PORTAL_URL}?app_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(window.location.origin + callbackUrl)}`;
    window.location.href = loginUrl;
  };

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
              Este link de configuração não existe ou está incorreto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = "/"}
            >
              Voltar para Home
            </Button>
          </CardContent>
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
                <Crown className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">Configure seu Box</CardTitle>
          <CardDescription>
            Você está prestes a se tornar o administrador do box
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Box */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">{box.nome}</h3>
            </div>
            {(box.cidade || box.estado) && (
              <p className="text-sm text-muted-foreground">
                {box.cidade}
                {box.cidade && box.estado && ", "}
                {box.estado}
              </p>
            )}
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-semibold">Como Box Master você poderá:</h4>
            <ul className="space-y-2">
              {[
                "Gerenciar WODs e treinos",
                "Convidar e administrar atletas",
                "Criar campeonatos e rankings",
                "Configurar agenda de aulas",
                "Acompanhar métricas e engajamento",
                "Enviar comunicados para todos",
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
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleLogin}
            >
              <Crown className="w-4 h-4 mr-2" />
              Criar Conta e Configurar Box
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Você pode fazer login com Google, Facebook ou Email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
