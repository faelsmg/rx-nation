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
import Comparar from "./pages/Comparar";
import Desafios from "./pages/Desafios";
import DesafioDetalhes from "./pages/DesafioDetalhes";
import Equipes from "./pages/Equipes";
import EquipeDetalhes from "./pages/EquipeDetalhes";
import LeaderboardEquipes from "./pages/LeaderboardEquipes";
import Conquistas from "./pages/Conquistas";
import AnalisePerformance from "./pages/AnalisePerformance";

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
      <Route path={"/comparar"} component={Comparar} />
      <Route path={"/desafios"} component={Desafios} />
      <Route path={"/desafios/:id"} component={DesafioDetalhes} />
      <Route path={"/equipes"} component={Equipes} />
      <Route path={"/equipes/:id"} component={EquipeDetalhes} />
      <Route path={"/leaderboard-equipes"} component={LeaderboardEquipes} />
      <Route path={"/conquistas"} component={Conquistas} />
      <Route path={"/analise-performance"} component={AnalisePerformance} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
