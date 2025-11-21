import { forwardRef } from "react";
import { Trophy, Award, TrendingUp, Flame } from "lucide-react";

interface FIFACardProps {
  type: "pr" | "badge" | "conquista";
  atletaNome: string;
  boxNome: string;
  categoria?: string;
  pontosTotais?: number;
  ranking?: number;
  
  // Para PRs
  movimento?: string;
  carga?: number;
  unidade?: string;
  dataRecorde?: string;
  
  // Para Badges
  badgeNome?: string;
  badgeIcone?: string;
  badgeDescricao?: string;
  
  // Para Conquistas
  conquistaNome?: string;
  conquistaDescricao?: string;
  progresso?: number;
  meta?: number;
}

export const FIFACard = forwardRef<HTMLDivElement, FIFACardProps>(
  (props, ref) => {
    const {
      type,
      atletaNome,
      boxNome,
      categoria = "ATLETA",
      pontosTotais = 0,
      ranking,
      movimento,
      carga,
      unidade = "kg",
      dataRecorde,
      badgeNome,
      badgeIcone,
      badgeDescricao,
      conquistaNome,
      conquistaDescricao,
      progresso,
      meta,
    } = props;

    // Cores de gradiente baseadas no tipo
    const gradients = {
      pr: "from-blue-600 via-blue-500 to-cyan-400",
      badge: "from-yellow-600 via-yellow-500 to-amber-400",
      conquista: "from-purple-600 via-purple-500 to-pink-400",
    };

    const gradient = gradients[type];
    const iniciais = atletaNome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        ref={ref}
        className="relative w-[400px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${
            type === "pr"
              ? "#1e40af, #0891b2"
              : type === "badge"
              ? "#ca8a04, #f59e0b"
              : "#7c3aed, #ec4899"
          })`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_52%)] bg-[length:20px_20px]" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col p-8 text-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-5xl font-black mb-1">{ranking || "—"}</div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-90">
                {categoria}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">
                RX
              </div>
              <div className="text-lg font-black">NATION</div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/40 shadow-xl">
              <span className="text-6xl font-black">{iniciais}</span>
            </div>
          </div>

          {/* Nome do Atleta */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-1">
              {atletaNome}
            </h2>
            <p className="text-sm font-semibold opacity-90">{boxNome}</p>
          </div>

          {/* Stats Section */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {type === "pr" && movimento && carga && (
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase opacity-90">
                      Movimento
                    </span>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black">{movimento}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase opacity-90">
                      Personal Record
                    </span>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-4xl font-black">
                    {carga} {unidade}
                  </div>
                  {dataRecorde && (
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(dataRecorde).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
              </>
            )}

            {type === "badge" && badgeNome && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="text-8xl">{badgeIcone || "🏆"}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase opacity-90">
                      Badge Desbloqueado
                    </span>
                  </div>
                  <div className="text-2xl font-black mb-2">{badgeNome}</div>
                  {badgeDescricao && (
                    <div className="text-sm opacity-90">{badgeDescricao}</div>
                  )}
                </div>
              </>
            )}

            {type === "conquista" && conquistaNome && (
              <>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase opacity-90">
                      Conquista
                    </span>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black mb-2">{conquistaNome}</div>
                  {conquistaDescricao && (
                    <div className="text-sm opacity-90 mb-3">
                      {conquistaDescricao}
                    </div>
                  )}
                  {progresso !== undefined && meta !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span className="font-bold">
                          {progresso}/{meta}
                        </span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(progresso / meta) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
              <div className="text-xs font-bold uppercase opacity-90 mb-1">
                Pontos
              </div>
              <div className="text-2xl font-black">{pontosTotais}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
              <div className="text-xs font-bold uppercase opacity-90 mb-1">
                Ranking
              </div>
              <div className="text-2xl font-black">#{ranking || "—"}</div>
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      </div>
    );
  }
);

FIFACard.displayName = "FIFACard";
