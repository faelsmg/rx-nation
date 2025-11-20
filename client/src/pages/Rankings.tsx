import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Rankings() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Rankings
          </h1>
          <p className="text-muted-foreground">Sua posição nos rankings</p>
        </div>

        <Card className="card-impacto">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Rankings em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
