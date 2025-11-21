import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Video } from "lucide-react";
import { useState } from "react";

// Biblioteca curada de vídeos educacionais
const VIDEOS_EDUCACIONAIS = {
  olimpicos: [
    {
      id: 1,
      titulo: "Snatch - Técnica Completa",
      descricao: "Aprenda a execução perfeita do Snatch com dicas de atletas olímpicos",
      url: "https://www.youtube.com/watch?v=9xQp2sldyts",
      duracao: "12:45",
    },
    {
      id: 2,
      titulo: "Clean & Jerk - Passo a Passo",
      descricao: "Domine o Clean & Jerk com progressões e correções comuns",
      url: "https://www.youtube.com/watch?v=PjY1rH4_MOA",
      duracao: "15:30",
    },
    {
      id: 3,
      titulo: "Overhead Squat - Mobilidade e Técnica",
      descricao: "Como melhorar seu Overhead Squat com exercícios de mobilidade",
      url: "https://www.youtube.com/watch?v=RD_vUnqwqqI",
      duracao: "10:20",
    },
  ],
  ginastica: [
    {
      id: 4,
      titulo: "Muscle-Up - Progressões",
      descricao: "Do básico ao avançado: conquiste seu primeiro Muscle-Up",
      url: "https://www.youtube.com/watch?v=tB3X4TjTIes",
      duracao: "18:15",
    },
    {
      id: 5,
      titulo: "Handstand Push-Up - Técnica",
      descricao: "Aprenda a fazer HSPU com forma perfeita e segurança",
      url: "https://www.youtube.com/watch?v=tQhrk6WMcKw",
      duracao: "14:50",
    },
    {
      id: 6,
      titulo: "Kipping Pull-Up vs Strict",
      descricao: "Diferenças, benefícios e quando usar cada variação",
      url: "https://www.youtube.com/watch?v=kHSMRBnXcgg",
      duracao: "11:30",
    },
  ],
  forca: [
    {
      id: 7,
      titulo: "Back Squat - Forma Perfeita",
      descricao: "Maximize sua força no Back Squat com técnica correta",
      url: "https://www.youtube.com/watch?v=ultWZbUMPL8",
      duracao: "13:20",
    },
    {
      id: 8,
      titulo: "Deadlift - Evite Lesões",
      descricao: "Como fazer Deadlift com segurança e eficiência",
      url: "https://www.youtube.com/watch?v=op9kVnSso6Q",
      duracao: "16:40",
    },
    {
      id: 9,
      titulo: "Front Squat - Mobilidade de Punho",
      descricao: "Melhore seu Front Squat com exercícios de mobilidade",
      url: "https://www.youtube.com/watch?v=m4ytaCJZpl0",
      duracao: "9:55",
    },
  ],
  cardio: [
    {
      id: 10,
      titulo: "Double Unders - Tutorial Completo",
      descricao: "Aprenda Double Unders do zero com dicas práticas",
      url: "https://www.youtube.com/watch?v=hCuXYrTOMxI",
      duracao: "8:30",
    },
    {
      id: 11,
      titulo: "Rowing - Técnica e Eficiência",
      descricao: "Como remar corretamente e economizar energia",
      url: "https://www.youtube.com/watch?v=zQ82RYIFLN8",
      duracao: "12:10",
    },
    {
      id: 12,
      titulo: "Assault Bike - Estratégias",
      descricao: "Domine o Assault Bike com ritmo e respiração",
      url: "https://www.youtube.com/watch?v=YLrMFJXwMPU",
      duracao: "10:45",
    },
  ],
  mobilidade: [
    {
      id: 13,
      titulo: "Mobilidade de Ombro",
      descricao: "Exercícios essenciais para melhorar overhead movements",
      url: "https://www.youtube.com/watch?v=zgU5KtDz2VQ",
      duracao: "15:25",
    },
    {
      id: 14,
      titulo: "Mobilidade de Quadril",
      descricao: "Aumente sua profundidade no squat com esses drills",
      url: "https://www.youtube.com/watch?v=JBHzXF-mVjY",
      duracao: "13:50",
    },
    {
      id: 15,
      titulo: "Mobilidade de Tornozelo",
      descricao: "Melhore seu agachamento com mobilidade de tornozelo",
      url: "https://www.youtube.com/watch?v=uwLM5n-rYmA",
      duracao: "11:15",
    },
  ],
};

type Categoria = keyof typeof VIDEOS_EDUCACIONAIS;

export default function BibliotecaVideos() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>("olimpicos");

  const videosFiltrados = VIDEOS_EDUCACIONAIS[categoriaAtiva].filter(
    (video) =>
      video.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      video.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? match[1] : "";
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-primary" />
            Biblioteca de Vídeos
          </h1>
          <p className="text-muted-foreground">
            Aprenda com os melhores tutoriais de CrossFit
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar vídeos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={categoriaAtiva} onValueChange={(v) => setCategoriaAtiva(v as Categoria)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="olimpicos">Olímpicos</TabsTrigger>
            <TabsTrigger value="ginastica">Ginástica</TabsTrigger>
            <TabsTrigger value="forca">Força</TabsTrigger>
            <TabsTrigger value="cardio">Cardio</TabsTrigger>
            <TabsTrigger value="mobilidade">Mobilidade</TabsTrigger>
          </TabsList>

          {(["olimpicos", "ginastica", "forca", "cardio", "mobilidade"] as Categoria[]).map((cat) => (
            <TabsContent key={cat} value={cat} className="space-y-6">
              {videosFiltrados.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {videosFiltrados.map((video) => (
                    <Card key={video.id} className="card-impacto overflow-hidden">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${getVideoId(video.url)}`}
                          title={video.titulo}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Video className="w-5 h-5 text-primary" />
                          {video.titulo}
                        </CardTitle>
                        <CardDescription>{video.descricao}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Duração: {video.duracao}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-impacto">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                      Nenhum vídeo encontrado com "{busca}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
