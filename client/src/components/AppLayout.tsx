import { useAuth } from "@/_core/hooks/useAuth";
import { NotificationCenter } from "@/components/NotificationCenter";
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
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
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

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Dumbbell, label: "WOD do Dia", path: "/wod", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: History, label: "Histórico", path: "/historico", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: TrendingUp, label: "Análise de Performance", path: "/analise-performance", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Trophy, label: "Rankings", path: "/rankings", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Award, label: "Badges", path: "/badges", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Target, label: "Metas", path: "/metas", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Users, label: "Feed", path: "/feed", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Swords, label: "Desafios", path: "/desafios", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Users, label: "Equipes", path: "/equipes", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Trophy, label: "Leaderboard Equipes", path: "/leaderboard-equipes", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Target, label: "Conquistas", path: "/conquistas", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Users, label: "Comparar Atletas", path: "/comparacao", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: MessageCircle, label: "Mensagens", path: "/mensagens", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Calendar, label: "Eventos", path: "/calendario-eventos", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: QrCode, label: "Meu QR Code", path: "/meu-qrcode", roles: ["atleta"] },
    { icon: ScanLine, label: "Scanner Check-in", path: "/scanner-qrcode", roles: ["box_master", "admin_liga"] },
    { icon: CreditCard, label: "Minha Assinatura", path: "/minha-assinatura", roles: ["atleta"] },
    { icon: FileText, label: "Gestão de Planos", path: "/gestao-planos", roles: ["box_master", "admin_liga"] },
    { icon: Users, label: "Gestão de Assinaturas", path: "/gestao-assinaturas", roles: ["box_master", "admin_liga"] },
    { icon: BarChart3, label: "Dashboard Financeiro", path: "/dashboard-financeiro", roles: ["box_master", "admin_liga"] },
    { icon: Tag, label: "Gestão de Cupons", path: "/gestao-cupons", roles: ["box_master", "admin_liga"] },
    { icon: UserPlus, label: "Minhas Indicações", path: "/minhas-indicacoes", roles: ["atleta"] },
    { icon: Scale, label: "Avaliações Físicas", path: "/avaliacoes-fisicas", roles: ["atleta", "box_master", "admin_liga"] },
    { icon: Briefcase, label: "Gestão Administrativa", path: "/gestao-administrativa", roles: ["box_master", "admin_liga"] },
    { icon: ShoppingCart, label: "Gestão de Compras", path: "/gestao-compras", roles: ["box_master", "admin_liga"] },
    { icon: Package, label: "Gestão de Estoque", path: "/gestao-estoque", roles: ["box_master", "admin_liga"] },
    { icon: Banknote, label: "PDV - Ponto de Venda", path: "/pdv", roles: ["box_master", "admin_liga"] },
    { icon: Calendar, label: "Campeonatos", path: "/campeonatos", roles: ["atleta", "box_master", "franqueado", "admin_liga"] },
    { icon: Activity, label: "Dashboard Coach", path: "/dashboard-coach", roles: ["box_master", "admin_liga"] },
    { icon: Users, label: "Gestão do Box", path: "/gestao-box", roles: ["box_master", "admin_liga"] },
    { icon: Building2, label: "Painel Franqueado", path: "/franqueado", roles: ["franqueado"] },
    { icon: Shield, label: "Admin da Liga", path: "/admin", roles: ["admin_liga"] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "atleta")
  );

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
          <div>
            <h1 className="text-lg font-bold text-primary">IMPACTO</h1>
            <p className="text-xs text-muted-foreground">PRO LEAGUE</p>
          </div>
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
    </div>
  );
}
