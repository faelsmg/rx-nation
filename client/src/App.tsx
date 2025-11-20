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
