import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function GestaoBox() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            Gestão do Box
          </h1>
          <p className="text-muted-foreground">Gerencie seu box</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Funcionalidades de gestão em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
