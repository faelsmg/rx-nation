import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";

interface WodCalendarViewProps {
  boxId: number;
  onDateClick?: (date: Date) => void;
  onWodClick?: (wod: any) => void;
}

export function WodCalendarView({ boxId, onDateClick, onWodClick }: WodCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calcular primeiro e último dia do mês
  const firstDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentDate]);

  const lastDayOfMonth = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [currentDate]);

  // Buscar WODs do mês
  const { data: wods = [], isLoading } = trpc.wods.getByDateRange.useQuery({
    boxId,
    startDate: firstDayOfMonth,
    endDate: lastDayOfMonth,
  });

  // Criar mapa de WODs por data
  const wodsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    wods.forEach((wod) => {
      const dateKey = new Date(wod.data).toISOString().split("T")[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(wod);
    });
    return map;
  }, [wods]);

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Primeiro dia da semana (0 = domingo)
    const firstDayWeek = firstDayOfMonth.getDay();

    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < firstDayWeek; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split("T")[0];
      const dayWods = wodsByDate.get(dateKey) || [];
      days.push({ date, wods: dayWods });
    }

    return days;
  }, [currentDate, wodsByDate, firstDayOfMonth]);

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendário de WODs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center capitalize">
              {monthName}
            </span>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Carregando calendário...</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Cabeçalho dos dias da semana */}
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Dias do calendário */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const { date, wods: dayWods } = day;
              const today = isToday(date);
              const past = isPast(date);
              const hasWods = dayWods.length > 0;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    if (hasWods && onWodClick) {
                      onWodClick(dayWods[0]);
                    } else if (onDateClick) {
                      onDateClick(date);
                    }
                  }}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all
                    ${today ? "border-primary bg-primary/10" : "border-border"}
                    ${hasWods ? "bg-accent hover:bg-accent/80" : "hover:bg-muted"}
                    ${past && !hasWods ? "opacity-50" : ""}
                    flex flex-col items-center justify-start
                  `}
                >
                  <span
                    className={`text-sm font-medium ${
                      today ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {hasWods && (
                    <div className="mt-1 space-y-0.5 w-full">
                      {dayWods.slice(0, 2).map((wod, i) => (
                        <div
                          key={i}
                          className="text-[10px] bg-primary text-primary-foreground rounded px-1 py-0.5 truncate"
                          title={wod.titulo}
                        >
                          {wod.titulo}
                        </div>
                      ))}
                      {dayWods.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{dayWods.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10" />
            <span>Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-border bg-accent" />
            <span>Com WOD</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
