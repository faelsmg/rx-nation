import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { User } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-primary" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">Suas informações</p>
        </div>

        <Card className="card-impacto">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-bold">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perfil</p>
              <p className="text-lg capitalize">{user?.role?.replace("_", " ")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
