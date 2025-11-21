import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WodDoDia from "./pages/WodDoDia";
import Historico from "./pages/Historico";
import PRs from "./pages/PRs";
import Rankings from "./pages/Rankings";
import Badges from "./pages/Badges";
import Campeonatos from "./pages/Campeonatos";
import CampeonatoDetalhes from "./pages/CampeonatoDetalhes";
import CampeonatosAdmin from "./pages/CampeonatosAdmin";
import GestaoInscricoes from "./pages/GestaoInscricoes";
import DashboardCampeonatos from "./pages/DashboardCampeonatos";
import Perfil from "./pages/Perfil";
import GestaoBox from "./pages/GestaoBox";
import AdminLiga from "./pages/AdminLiga";
import Agenda from "./pages/Agenda";
import Franqueado from "./pages/Franqueado";
import Preferencias from "./pages/Preferencias";
import Notificacoes from "./pages/Notificacoes";
import PerfilPublico from "./pages/PerfilPublico";
import Metas from "./pages/Metas";
import Feed from "./pages/Feed";

import Desafios from "./pages/Desafios";
import DesafioDetalhes from "./pages/DesafioDetalhes";
import Equipes from "./pages/Equipes";
import EquipeDetalhes from "./pages/EquipeDetalhes";
import LeaderboardEquipes from "./pages/LeaderboardEquipes";
import Conquistas from "./pages/Conquistas";
import AnalisePerformance from "./pages/AnalisePerformance";
import RealtimeNotifications from "./components/RealtimeNotifications";
import DashboardCoach from "./pages/DashboardCoach";
import ComparacaoAtletas from "./pages/ComparacaoAtletas";
import Mensagens from "./pages/Mensagens";
import CalendarioEventos from "./pages/CalendarioEventos";
import MeuQRCode from "./pages/MeuQRCode";
import ScannerQRCode from "./pages/ScannerQRCode";
import GestaoPlanos from "./pages/GestaoPlanos";
import GestaoAssinaturas from "./pages/GestaoAssinaturas";
import MinhaAssinatura from "./pages/MinhaAssinatura";
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import GestaoCupons from "./pages/GestaoCupons";
import MinhasIndicacoes from "./pages/MinhasIndicacoes";
import AvaliacoesFisicas from "./pages/AvaliacoesFisicas";
import GestaoAdministrativa from "./pages/GestaoAdministrativa";
import GestaoCompras from "./pages/GestaoCompras";
import GestaoEstoque from "./pages/GestaoEstoque";
import DashboardFinanceiroGeral from "./pages/DashboardFinanceiroGeral";
import PDV from "./pages/PDV";
import Chat from "./pages/Chat";
import BibliotecaVideos from "./pages/BibliotecaVideos";
import WODsFamosos from "./pages/WODsFamosos";
import MinhasPlaylists from "./pages/MinhasPlaylists";
import DescobrirPlaylists from "./pages/DescobrirPlaylists";
import GestaoBoxesLiga from "./pages/GestaoBoxesLiga";
import MensagensDiretas from "./pages/MensagensDiretas";
import AnalyticsAvancado from "./pages/AnalyticsAvancado";
import ArvoreConquistas from "./pages/ArvoreConquistas";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/wod"} component={WodDoDia} />
      <Route path={"/historico"} component={Historico} />
      <Route path={"/prs"} component={PRs} />
      <Route path={"/rankings"} component={Rankings} />
      <Route path={"/badges"} component={Badges} />
      <Route path={"/campeonatos"} component={Campeonatos} />
      <Route path={"/campeonatos/:id"} component={CampeonatoDetalhes} />
      <Route path={"/campeonatos/:id/inscricoes"} component={GestaoInscricoes} />
      <Route path={"/admin/campeonatos"} component={CampeonatosAdmin} />
      <Route path={"/admin/dashboard-campeonatos"} component={DashboardCampeonatos} />
      <Route path={"/perfil"} component={Perfil} />
      <Route path={"/gestao-box"} component={GestaoBox} />
      <Route path={"/admin"} component={AdminLiga} />
      <Route path={"/agenda"} component={Agenda} />
      <Route path={"/franqueado"} component={Franqueado} />
      <Route path={"/preferencias"} component={Preferencias} />
      <Route path={"/notificacoes"} component={Notificacoes} />
      <Route path={"/atleta/:id"} component={PerfilPublico} />
      <Route path={"/metas"} component={Metas} />
      <Route path={"/feed"} component={Feed} />

      <Route path={"/desafios"} component={Desafios} />
      <Route path={"/desafios/:id"} component={DesafioDetalhes} />
      <Route path={"/equipes"} component={Equipes} />
      <Route path={"/equipes/:id"} component={EquipeDetalhes} />
      <Route path={"/leaderboard-equipes"} component={LeaderboardEquipes} />
      <Route path={"/conquistas"} component={Conquistas} />
      <Route path={"/analise-performance"} component={AnalisePerformance} />
      <Route path={"/dashboard-coach"} component={DashboardCoach} />
      <Route path={"/comparacao"} component={ComparacaoAtletas} />
      <Route path={"/mensagens"} component={Mensagens} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/biblioteca-videos"} component={BibliotecaVideos} />
      <Route path={"/wods-famosos"} component={WODsFamosos} />
      <Route path={"/minhas-playlists"} component={MinhasPlaylists} />
      <Route path={"/descobrir-playlists"} component={DescobrirPlaylists} />
      <Route path={"/gestao-boxes-liga"} component={GestaoBoxesLiga} />
      <Route path="/mensagens-diretas" component={MensagensDiretas} />
      <Route path="/analytics-avancado" component={AnalyticsAvancado} />
      <Route path="/arvore-conquistas" component={ArvoreConquistas} />
      <Route path={"/calendario-eventos"} component={CalendarioEventos} />
      <Route path={"/meu-qrcode"} component={MeuQRCode} />
      <Route path={"/scanner-qrcode"} component={ScannerQRCode} />
      <Route path={"/gestao-planos"} component={GestaoPlanos} />
      <Route path={"/gestao-assinaturas"} component={GestaoAssinaturas} />
      <Route path={"/minha-assinatura"} component={MinhaAssinatura} />
      <Route path={"/dashboard-financeiro"} component={DashboardFinanceiro} />
      <Route path={"/gestao-cupons"} component={GestaoCupons} />
      <Route path={"/minhas-indicacoes"} component={MinhasIndicacoes} />
      <Route path={"/avaliacoes-fisicas"} component={AvaliacoesFisicas} />
      <Route path="/gestao-administrativa" component={GestaoAdministrativa} />
      <Route path="/gestao-compras" component={GestaoCompras} />
      <Route path="/gestao-estoque" component={GestaoEstoque} />
      <Route path="/pdv" component={PDV} />
      <Route path="/financeiro-geral" component={DashboardFinanceiroGeral} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <RealtimeNotifications />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
