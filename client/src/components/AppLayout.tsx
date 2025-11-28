import { useAuth } from "@/_core/hooks/useAuth";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PWAInstallButton, PWAOfflineIndicator } from "@/components/PWAInstallButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Onboarding } from "@/components/Onboarding";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Dumbbell,
  History,
  TrendingUp,
  Trophy,
  Award,
  Calendar,
  User,
  Settings,
  Menu,
  LogOut,
  Users,
  Shield,
  Building2,
  Swords,
  Target,
  Activity,
  MessageCircle,
  QrCode,
  ScanLine,
  CreditCard,
  FileText,
  BarChart3,
  Tag,
  UserPlus,
  Scale,
  Briefcase,
  ShoppingCart,
  Package,
  Banknote,
  LineChart,
  BookOpen,
  Video,
  Compass,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const location = window.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <img src={APP_LOGO} alt={APP_TITLE} className="w-32 h-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Menus específicos por role
  const getMenuItems = () => {
    const role = user?.role || "atleta";

    // ATLETA - Foco em treino e performance
    if (role === "atleta") {
      return [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Dumbbell, label: "WOD do Dia", path: "/wod" },
        { icon: History, label: "Histórico", path: "/historico" },
        { icon: Trophy, label: "PRs", path: "/prs" },
        { icon: LineChart, label: "Histórico de PRs", path: "/historico-prs" },
        { icon: BarChart3, label: "Ranking de PRs", path: "/ranking-prs" },
        { icon: TrendingUp, label: "Rankings", path: "/rankings" },
        { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
        { icon: Award, label: "Badges", path: "/badges" },
        { icon: Target, label: "Metas", path: "/metas" },
        { icon: Users, label: "Feed de Amigos", path: "/feed-seguidos" },
        { icon: ShoppingCart, label: "Marketplace", path: "/marketplace" },
        { icon: Activity, label: "Insights IA", path: "/insights-ia" },
        { icon: MessageCircle, label: "Mensagens", path: "/mensagens" },
      ];
    }

    // BOX MASTER - Gestão do box
    if (role === "box_master") {
      return [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Building2, label: "Gestão do Box", path: "/gestao-box" },
        { icon: Users, label: "Alunos", path: "/alunos" },
        { icon: Dumbbell, label: "WODs", path: "/wods" },
        { icon: MessageCircle, label: "Comunicados", path: "/comunicados" },
        { icon: Calendar, label: "Agenda", path: "/agenda" },
        { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
        { icon: ScanLine, label: "Scanner Check-in", path: "/scanner-qrcode" },
      ];
    }

    // FRANQUEADO - Visão consolidada
    if (role === "franqueado") {
      return [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Building2, label: "Meus Boxes", path: "/meus-boxes" },
        { icon: BarChart3, label: "Analytics", path: "/analytics-avancado" },
        { icon: FileText, label: "Relatórios", path: "/relatorios-franqueado" },
      ];
    }

    // ADMIN DA LIGA - Gestão global
    if (role === "admin_liga") {
      return [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Building2, label: "Gestão de Boxes", path: "/gestao-boxes-liga" },
        { icon: Trophy, label: "Campeonatos", path: "/campeonatos" },
        { icon: Settings, label: "Configurações", path: "/configuracoes" },
        { icon: BarChart3, label: "Relatórios Globais", path: "/relatorios-globais" },
      ];
    }

    // Fallback
    return [{ icon: Home, label: "Dashboard", path: "/dashboard" }];
  };

  const filteredMenuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={APP_LOGO} alt={APP_TITLE} className="w-12 h-12" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary">IMPACTO</h1>
            <p className="text-xs text-muted-foreground">PRO LEAGUE</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/perfil">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <User className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </Link>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            <span className="font-bold text-primary">IMPACTO PRO LEAGUE</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <PWAInstallButton />
            <NotificationCenter />
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        {children}
      </main>

      {/* PWA Offline Indicator */}
      <PWAOfflineIndicator />

      {/* Onboarding Tour */}
      <Onboarding />
    </div>
  );
}
