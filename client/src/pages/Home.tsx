import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Trophy, Target, Users, Award, TrendingUp, Dumbbell } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <img src={APP_LOGO} alt={APP_TITLE} className="w-32 h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container relative z-10 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-48 h-48 lg:w-64 lg:w-64 animate-fade-in" />
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gradient-impacto">
              {APP_TITLE}
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl">
              O ecossistema completo para treinos, competições e rankings de CrossFit.
              Junte-se à maior liga de atletas do Brasil.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <Dumbbell className="mr-2 h-5 w-5" />
                Entrar no App
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Saiba Mais
              </Button>
            </div>
            
            {/* Botões de Teste Rápido (apenas para desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-12 p-6 bg-card/80 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-4 font-semibold">Acesso Rápido para Testes:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => window.location.href = '/api/dev-login?openId=test-admin-liga-gabriel'}
                  >
                    🏆 Admin Liga (Gabriel/Messi)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => window.location.href = '/api/dev-login?openId=test-box-master-carlos'}
                  >
                    🏋️ Box Master (Carlos)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => window.location.href = '/api/dev-login?openId=test-franqueado-ricardo'}
                  >
                    🏪 Franqueado (Ricardo)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 hover:bg-primary/10"
                    onClick={() => window.location.href = '/api/dev-login?openId=test-atleta-joao'}
                  >
                    🥇 Atleta (João)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 lg:py-32 bg-card/50">
        <div className="container">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-gradient-impacto">
            Funcionalidades
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-12 h-12 text-primary" />}
              title="WODs Diários"
              description="Acesse treinos diários do seu box, registre resultados e acompanhe sua evolução."
            />
            
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-primary" />}
              title="Personal Records"
              description="Registre e acompanhe seus PRs em todos os movimentos do CrossFit."
            />
            
            <FeatureCard
              icon={<Trophy className="w-12 h-12 text-primary" />}
              title="Campeonatos"
              description="Participe de competições locais, regionais, estaduais e nacionais."
            />
            
            <FeatureCard
              icon={<Award className="w-12 h-12 text-primary" />}
              title="Rankings"
              description="Veja sua posição nos rankings do box, regional e da temporada."
            />
            
            <FeatureCard
              icon={<Users className="w-12 h-12 text-primary" />}
              title="Gamificação"
              description="Ganhe pontos, badges e medalhas digitais por suas conquistas."
            />
            
            <FeatureCard
              icon={<Dumbbell className="w-12 h-12 text-primary" />}
              title="Gestão de Box"
              description="Ferramentas completas para donos de box gerenciarem alunos e treinos."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 lg:py-32">
        <div className="container">
          <div className="card-impacto max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Pronto para começar?
            </h2>
            
            <p className="text-xl text-muted-foreground">
              Entre agora e faça parte da maior comunidade de CrossFit do Brasil.
            </p>
            
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <Dumbbell className="mr-2 h-5 w-5" />
              Entrar Agora
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card-impacto text-center space-y-4">
      <div className="flex justify-center">{icon}</div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
