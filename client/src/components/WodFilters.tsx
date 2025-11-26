import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";
import { useState } from "react";

export type DateFilter = "all" | "this_week" | "next_week" | "this_month" | "next_month";

interface WodFiltersProps {
  onFilterChange: (filter: DateFilter, startDate?: Date, endDate?: Date) => void;
  currentFilter: DateFilter;
}

export function WodFilters({ onFilterChange, currentFilter }: WodFiltersProps) {
  const getWeekDates = (offset: number = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + offset * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const getMonthDates = (offset: number = 0) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return { startOfMonth, endOfMonth };
  };

  const handleFilterClick = (filter: DateFilter) => {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (filter) {
      case "this_week": {
        const { startOfWeek, endOfWeek } = getWeekDates(0);
        startDate = startOfWeek;
        endDate = endOfWeek;
        break;
      }
      case "next_week": {
        const { startOfWeek, endOfWeek } = getWeekDates(1);
        startDate = startOfWeek;
        endDate = endOfWeek;
        break;
      }
      case "this_month": {
        const { startOfMonth, endOfMonth } = getMonthDates(0);
        startDate = startOfMonth;
        endDate = endOfMonth;
        break;
      }
      case "next_month": {
        const { startOfMonth, endOfMonth } = getMonthDates(1);
        startDate = startOfMonth;
        endDate = endOfMonth;
        break;
      }
      case "all":
      default:
        startDate = undefined;
        endDate = undefined;
        break;
    }

    onFilterChange(filter, startDate, endDate);
  };

  const filters: { value: DateFilter; label: string; icon?: React.ReactNode }[] = [
    { value: "all", label: "Todos" },
    { value: "this_week", label: "Esta Semana" },
    { value: "next_week", label: "Próxima Semana" },
    { value: "this_month", label: "Este Mês" },
    { value: "next_month", label: "Próximo Mês" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filtrar:</span>
      </div>
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick(filter.value)}
        >
          {filter.icon}
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
