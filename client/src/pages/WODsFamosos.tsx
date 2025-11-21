import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, Zap, Target, Video } from "lucide-react";
import { useState } from "react";

// Galeria curada de WODs clássicos do CrossFit
const WODS_FAMOSOS = {
  heroes: [
    {
      id: 1,
      nome: "Murph",
      descricao: "Em homenagem ao Tenente Michael Murphy, morto no Afeganistão em 28 de junho de 2005.",
      tipo: "For Time",
      workout: "1 Mile Run\n100 Pull-ups\n200 Push-ups\n300 Air Squats\n1 Mile Run\n\n*Particionado como quiser\n*Com colete de 9kg (RX)",
      videoUrl: "https://www.youtube.com/watch?v=oApAdwuqtn8",
      recordeMundial: "34:13 (Hunter McIntyre)",
      dificuldade: "Extremo",
      categoria: "Hero WOD",
    },
    {
      id: 2,
      nome: "Fran",
      descricao: "Um dos WODs mais icônicos do CrossFit, conhecido por sua intensidade brutal.",
      tipo: "For Time",
      workout: "21-15-9 reps de:\nThrusters (43kg/29kg)\nPull-ups",
      videoUrl: "https://www.youtube.com/watch?v=M0GaxC20FvE",
      recordeMundial: "1:54 (Josh Bridges)",
      dificuldade: "Avançado",
      categoria: "Benchmark",
    },
    {
      id: 3,
      nome: "Helen",
      descricao: "WOD clássico que combina corrida, KB swings e pull-ups.",
      tipo: "For Time",
      workout: "3 Rounds:\n400m Run\n21 KB Swings (24kg/16kg)\n12 Pull-ups",
      videoUrl: "https://www.youtube.com/watch?v=7E3KCJCyAqw",
      recordeMundial: "6:35 (Tia-Clair Toomey)",
      dificuldade: "Intermediário",
      categoria: "Benchmark",
    },
    {
      id: 4,
      nome: "DT",
      descricao: "Em homenagem ao Sargento Timothy P. Davis, morto em 20 de fevereiro de 2009.",
      tipo: "For Time",
      workout: "5 Rounds:\n12 Deadlifts (70kg/47kg)\n9 Hang Power Cleans\n6 Push Jerks",
      videoUrl: "https://www.youtube.com/watch?v=7E3KCJCyAqw",
      recordeMundial: "4:38 (Rich Froning)",
      dificuldade: "Avançado",
      categoria: "Hero WOD",
    },
  ],
  benchmarks: [
    {
      id: 5,
      nome: "Cindy",
      descricao: "AMRAP clássico de ginástica, perfeito para iniciantes.",
      tipo: "AMRAP 20min",
      workout: "5 Pull-ups\n10 Push-ups\n15 Air Squats",
      videoUrl: "https://www.youtube.com/watch?v=cCMvhQ4Y89g",
      recordeMundial: "43 rounds (Mat Fraser)",
      dificuldade: "Iniciante",
      categoria: "Benchmark",
    },
    {
      id: 6,
      nome: "Grace",
      descricao: "30 Clean & Jerks o mais rápido possível. Simples e brutal.",
      tipo: "For Time",
      workout: "30 Clean & Jerks (60kg/43kg)",
      videoUrl: "https://www.youtube.com/watch?v=kZzhIBq9_Yw",
      recordeMundial: "1:21 (Rich Froning)",
      dificuldade: "Avançado",
      categoria: "Benchmark",
    },
    {
      id: 7,
      nome: "Diane",
      descricao: "Combinação mortal de Deadlifts e HSPU.",
      tipo: "For Time",
      workout: "21-15-9 reps de:\nDeadlifts (102kg/70kg)\nHandstand Push-ups",
      videoUrl: "https://www.youtube.com/watch?v=M0GaxC20FvE",
      recordeMundial: "1:40 (Josh Bridges)",
      dificuldade: "Avançado",
      categoria: "Benchmark",
    },
    {
      id: 8,
      nome: "Karen",
      descricao: "150 Wall Balls. Teste de resistência mental e física.",
      tipo: "For Time",
      workout: "150 Wall Ball Shots (9kg/6kg, 3m/2.7m)",
      videoUrl: "https://www.youtube.com/watch?v=cCMvhQ4Y89g",
      recordeMundial: "4:21 (Rich Froning)",
      dificuldade: "Intermediário",
      categoria: "Benchmark",
    },
  ],
  games: [
    {
      id: 9,
      nome: "The Seven",
      descricao: "WOD dos CrossFit Games 2011, um dos mais memoráveis.",
      tipo: "For Time",
      workout: "7 Rounds:\n7 Handstand Push-ups\n7 Thrusters (61kg/43kg)\n7 Knees to Elbows\n7 Deadlifts (111kg/70kg)\n7 Burpees\n7 KB Swings (32kg/24kg)\n7 Pull-ups",
      videoUrl: "https://www.youtube.com/watch?v=M0GaxC20FvE",
      recordeMundial: "18:45 (Rich Froning)",
      dificuldade: "Extremo",
      categoria: "Games",
    },
    {
      id: 10,
      nome: "Kalsu",
      descricao: "Um dos WODs mais difíceis já criados. EMOM de Thrusters com burpees.",
      tipo: "EMOM",
      workout: "EMOM até completar 100 Thrusters (61kg/43kg):\n5 Burpees no início de cada minuto\nMáximo de Thrusters no tempo restante",
      videoUrl: "https://www.youtube.com/watch?v=7E3KCJCyAqw",
      recordeMundial: "18:00 (Rich Froning)",
      dificuldade: "Extremo",
      categoria: "Hero WOD",
    },
  ],
};

type Categoria = keyof typeof WODS_FAMOSOS;

export default function WODsFamosos() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>("heroes");

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade) {
      case "Iniciante":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "Intermediário":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "Avançado":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "Extremo":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? match[1] : "";
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            WODs Famosos
          </h1>
          <p className="text-muted-foreground">
            Conheça os WODs mais icônicos do CrossFit e seus recordes mundiais
          </p>
        </div>

        <Tabs value={categoriaAtiva} onValueChange={(v) => setCategoriaAtiva(v as Categoria)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heroes">Hero WODs</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="games">CrossFit Games</TabsTrigger>
          </TabsList>

          {(["heroes", "benchmarks", "games"] as Categoria[]).map((cat) => (
            <TabsContent key={cat} value={cat} className="space-y-6">
              <div className="grid gap-6">
                {WODS_FAMOSOS[cat].map((wod) => (
                  <Card key={wod.id} className="card-impacto">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-3xl text-primary">{wod.nome}</CardTitle>
                          <CardDescription className="text-base">{wod.descricao}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className={getDifficultyColor(wod.dificuldade)}>
                            {wod.dificuldade}
                          </Badge>
                          <Badge variant="outline" className="bg-primary/20 text-primary">
                            {wod.tipo}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Workout Description */}
                        <div className="space-y-4">
                          <div className="bg-accent/50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              Workout
                            </h3>
                            <pre className="whitespace-pre-wrap text-sm font-mono">
                              {wod.workout}
                            </pre>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold">Recorde Mundial:</span>
                            <span className="text-muted-foreground">{wod.recordeMundial}</span>
                          </div>
                        </div>

                        {/* Video */}
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Video className="w-5 h-5 text-primary" />
                            Vídeo Demonstrativo
                          </h3>
                          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={`https://www.youtube.com/embed/${getVideoId(wod.videoUrl)}`}
                              title={`${wod.nome} - Demonstração`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
