import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

/**
 * Componente Avatar reutilizável
 * Exibe foto de perfil ou iniciais como fallback
 */
export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  // Gerar iniciais a partir do nome
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = fallback ? getInitials(fallback) : alt.substring(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-semibold overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Se a imagem falhar ao carregar, esconder e mostrar fallback
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
