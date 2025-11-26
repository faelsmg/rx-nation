import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🏋️ Populando templates clássicos de WOD...\n");

const classicWods = [
  {
    nome: "Fran",
    descricao: `21-15-9 reps for time of:
Thrusters (43kg/30kg)
Pull-ups

Um dos benchmarks mais icônicos do CrossFit. Rápido, intenso e devastador.`,
    tipo: "for_time",
    timeCap: 20,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=M8up6A4QesU",
  },
  {
    nome: "Murph",
    descricao: `For time:
1 Mile Run
100 Pull-ups
200 Push-ups
300 Air Squats
1 Mile Run

*Com colete de 9kg (RX)

Em homenagem ao Tenente Michael Murphy, morto em combate no Afeganistão em 2005.`,
    tipo: "for_time",
    timeCap: 60,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=oMTnLcHj5Jw",
  },
  {
    nome: "Grace",
    descricao: `30 Clean & Jerks for time
(60kg/43kg)

Teste puro de força e resistência. Quanto mais rápido, melhor!`,
    tipo: "for_time",
    timeCap: 15,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=4W1LRWQ8Kzg",
  },
  {
    nome: "Cindy",
    descricao: `20 minutes AMRAP of:
5 Pull-ups
10 Push-ups
15 Air Squats

Clássico AMRAP de bodyweight. Quantos rounds você consegue?`,
    tipo: "amrap",
    duracao: 20,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=cMqh3KJnPQU",
  },
  {
    nome: "Helen",
    descricao: `3 rounds for time:
400m Run
21 Kettlebell Swings (24kg/16kg)
12 Pull-ups

Combinação perfeita de cardio, força e ginástica.`,
    tipo: "for_time",
    timeCap: 30,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=7I8KNXqgLmE",
  },
  {
    nome: "Diane",
    descricao: `21-15-9 reps for time of:
Deadlifts (102kg/70kg)
Handstand Push-ups

Força explosiva + habilidade ginástica. Um verdadeiro desafio!`,
    tipo: "for_time",
    timeCap: 20,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=vWCYnfMcLZU",
  },
  {
    nome: "Annie",
    descricao: `50-40-30-20-10 reps for time of:
Double-Unders
Sit-ups

Teste de coordenação e resistência core. Mantenha o ritmo!`,
    tipo: "for_time",
    timeCap: 20,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=eFQqrjMYnKE",
  },
  {
    nome: "Karen",
    descricao: `150 Wall Balls for time
(9kg/6kg to 3m/2.7m target)

Simples, mas brutal. 150 repetições de pura determinação.`,
    tipo: "for_time",
    timeCap: 25,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=fpUD04qAFxE",
  },
  {
    nome: "Jackie",
    descricao: `For time:
1000m Row
50 Thrusters (20kg/15kg)
30 Pull-ups

Cardio + força + ginástica. Tríplice ameaça!`,
    tipo: "for_time",
    timeCap: 25,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=NqXxXqpJhvI",
  },
  {
    nome: "Elizabeth",
    descricao: `21-15-9 reps for time of:
Cleans (60kg/43kg)
Ring Dips

Força e técnica. Mantenha a forma perfeita!`,
    tipo: "for_time",
    timeCap: 20,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=7K9lKnJqJhI",
  },
  {
    nome: "Nancy",
    descricao: `5 rounds for time:
400m Run
15 Overhead Squats (43kg/30kg)

Corrida + mobilidade + força. Desafio completo!`,
    tipo: "for_time",
    timeCap: 30,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=MqJvOqrXqfY",
  },
  {
    nome: "DT",
    descricao: `5 rounds for time:
12 Deadlifts (70kg/48kg)
9 Hang Power Cleans (70kg/48kg)
6 Push Jerks (70kg/48kg)

Em homenagem ao Sargento Timothy P. Davis, morto em combate no Afeganistão em 2009.`,
    tipo: "for_time",
    timeCap: 30,
    categoria: "classico",
    videoYoutubeUrl: "https://www.youtube.com/watch?v=Hxp7qvYKCZE",
  },
];

try {
  for (const wod of classicWods) {
    await connection.execute(
      `INSERT INTO wod_templates (nome, descricao, tipo, duracao, timeCap, videoYoutubeUrl, categoria, publico, vezesUsado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wod.nome,
        wod.descricao,
        wod.tipo,
        wod.duracao || null,
        wod.timeCap || null,
        wod.videoYoutubeUrl || null,
        wod.categoria,
        true, // público
        0, // vezesUsado
      ]
    );
    console.log(`✅ ${wod.nome} adicionado`);
  }

  console.log(`\n🎉 ${classicWods.length} templates clássicos criados com sucesso!`);
} catch (error) {
  console.error("❌ Erro ao popular templates:", error);
} finally {
  await connection.end();
}
