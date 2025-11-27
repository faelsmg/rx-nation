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
import RankingGlobal from "./pages/RankingGlobal";
import Perfil from "./pages/Perfil";
import EditarPerfil from "./pages/EditarPerfil";
import GestaoAlunos from "./pages/GestaoAlunos";
import GestaoBox from "./pages/GestaoBox";
import GestaoConvites from "./pages/GestaoConvites";
import JoinBox from "./pages/JoinBox";
import SetupBoxMaster from "./pages/SetupBoxMaster";
import Welcome from "./pages/Welcome";
import AdminLiga from "./pages/AdminLiga";
import Agenda from "./pages/Agenda";
import Franqueado from "./pages/Franqueado";
import Preferencias from "./pages/Preferencias";
import Notificacoes from "./pages/Notificacoes";
import PerfilPublico from "./pages/PerfilPublico";
import Metas from "./pages/Metas";
import Feed from "./pages/Feed";
import FeedSeguidos from "./pages/FeedSeguidos";
import SeguidoresSeguindo from "./pages/SeguidoresSeguindo";

import Desafios from "./pages/Desafios";
import DesafioDetalhes from "./pages/DesafioDetalhes";
import Equipes from "./pages/Equipes";
import EquipeDetalhes from "./pages/EquipeDetalhes";
import LeaderboardEquipes from "./pages/LeaderboardEquipes";
import LeaderboardEngajamento from "./pages/LeaderboardEngajamento";
import Conquistas from "./pages/Conquistas";
import FeedSocial from "./pages/FeedSocial";
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
import GestaoPremios from "./pages/GestaoPremios";
import MeusPremios from "./pages/MeusPremios";
import HistoricoPerformance from "./pages/HistoricoPerformance";
import RankingSemanal from "./pages/RankingSemanal";
import MeuProgresso from "./pages/MeuProgresso";
import Mentoria from "./pages/Mentoria";
import Marketplace from "./pages/Marketplace";
import Leaderboard from "./pages/Leaderboard";
import Configuracoes from "./pages/Configuracoes";
import RelatoriosGlobais from "./pages/RelatoriosGlobais";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/join/:slug" component={JoinBox} />
      <Route path="/setup-box/:slug" component={SetupBoxMaster} />
      <Route path="/welcome" component={Welcome} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/wod"} component={WodDoDia} />
      <Route path={"/historico"} component={Historico} />
      <Route path={"/prs"} component={PRs} />
      <Route path={"/rankings"} component={Rankings} />
      <Route path={"/ranking-semanal"} component={RankingSemanal} />
      <Route path={"/badges"} component={Badges} />
      <Route path={"/campeonatos"} component={Campeonatos} />
      <Route path={"/campeonatos/:id"} component={CampeonatoDetalhes} />
      <Route path={"/campeonatos/:id/inscricoes"} component={GestaoInscricoes} />
      <Route path={"/admin/campeonatos"} component={CampeonatosAdmin} />
      <Route path={"/admin/dashboard-campeonatos"} component={DashboardCampeonatos} />
      <Route path={"/ranking-global"} component={RankingGlobal} />
       <Route path="/perfil" component={Perfil} />
      <Route path="/perfil/editar" component={EditarPerfil} />
      <Route path="/feed-seguidos" component={FeedSeguidos} />
      <Route path="/seguidores/:userId" component={SeguidoresSeguindo} />
       <Route path="/gestao-box" component={GestaoBox} />
      <Route path="/gestao-alunos" component={GestaoAlunos} />
      <Route path="/gestao-convites" component={GestaoConvites} />
      <Route path={"/admin"} component={AdminLiga} />
      <Route path={"/agenda"} component={Agenda} />
      <Route path={"/franqueado"} component={Franqueado} />
      <Route path={"/preferencias"} component={Preferencias} />
      <Route path={"/notificacoes"} component={Notificacoes} />
      <Route path={"/atleta/:id"} component={PerfilPublico} />
      <Route path={"/metas"} component={Metas} />
      <Route path={"/meu-progresso"} component={MeuProgresso} />
      <Route path={"/mentoria"} component={Mentoria} />
      <Route path={"/marketplace"} component={Marketplace} />
      <Route path={"/feed"} component={Feed} />

      <Route path={"/desafios"} component={Desafios} />
      <Route path={"/desafios/:id"} component={DesafioDetalhes} />
      <Route path={"/equipes"} component={Equipes} />
      <Route path={"/equipes/:id"} component={EquipeDetalhes} />
      <Route path={"/leaderboard-equipes"} component={LeaderboardEquipes} />
      <Route path={"/leaderboard-engajamento"} component={LeaderboardEngajamento} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/conquistas"} component={Conquistas} />
      <Route path={"/feed-social"} component={FeedSocial} />
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
      <Route path="/gestao-premios" component={GestaoPremios} />
      <Route path="/meus-premios" component={MeusPremios} />
      <Route path="/historico-performance" component={HistoricoPerformance} />
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
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/relatorios-globais" component={RelatoriosGlobais} />
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
