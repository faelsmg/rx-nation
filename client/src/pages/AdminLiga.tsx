import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminLiga() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Admin da Liga
          </h1>
          <p className="text-muted-foreground">Administração da RX Nation</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Painel administrativo em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
